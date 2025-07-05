// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

struct Ledger {
    address user;
    uint availableBalance;
    uint totalBalance;
    uint[2] inferenceSigner;
    string additionalInfo;
    address[] inferenceProviders;
    address[] fineTuningProviders;
}

interface ILedger {
    function spendFund(address user, uint amount) external;
}

interface IServing {
    function accountExists(address user, address provider) external view returns (bool);

    function getPendingRefund(address user, address provider) external view returns (uint);

    function depositFund(address user, address provider, uint cancelRetrievingAmount) external payable;

    function requestRefundAll(address user, address provider) external;

    function processRefund(
        address user,
        address provider
    ) external returns (uint totalAmount, uint balance, uint pendingRefund);

    function deleteAccount(address user, address provider) external;
}

contract LedgerManager is Ownable, Initializable {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    address payable public inferenceAddress;
    address payable public fineTuningAddress;
    LedgerMap private ledgerMap;
    IServing private fineTuningAccount;
    IServing private inferenceAccount;

    error LedgerNotExists(address user);
    error LedgerExists(address user);
    error InsufficientBalance(address user);

    struct LedgerMap {
        EnumerableSet.Bytes32Set _keys;
        mapping(bytes32 => Ledger) _values;
    }

    function initialize(
        address _inferenceAddress,
        address _fineTuningAddress,
        address owner
    ) public onlyInitializeOnce {
        _transferOwnership(owner);

        inferenceAddress = payable(_inferenceAddress);
        fineTuningAddress = payable(_fineTuningAddress);
        fineTuningAccount = IServing(fineTuningAddress);
        inferenceAccount = IServing(inferenceAddress);
    }

    modifier onlyServing() {
        require(
            msg.sender == fineTuningAddress || msg.sender == inferenceAddress,
            "Caller is not the fine tuning or inference contract"
        );
        _;
    }

    function getLedger(address user) public view returns (Ledger memory) {
        return _get(user);
    }

    function getAllLedgers() public view returns (Ledger[] memory ledgers) {
        uint len = _length();
        ledgers = new Ledger[](len);

        for (uint i = 0; i < len; i++) {
            ledgers[i] = _at(i);
        }
    }

    function addLedger(
        uint[2] calldata inferenceSigner,
        string memory additionalInfo
    ) external payable returns (uint, uint) {
        bytes32 key = _key(msg.sender);
        if (_contains(key)) {
            revert LedgerExists(msg.sender);
        }
        _set(key, msg.sender, inferenceSigner, msg.value, additionalInfo);
        return (msg.value, 0);
    }

    function depositFund() external payable {
        bytes32 key = _key(msg.sender);
        if (!_contains(key)) {
            revert LedgerNotExists(msg.sender);
        }
        Ledger storage ledger = _get(msg.sender);

        ledger.availableBalance += msg.value;
        ledger.totalBalance += msg.value;
    }

    function refund(uint amount) external {
        Ledger storage ledger = _get(msg.sender);
        if (ledger.availableBalance < amount) {
            revert InsufficientBalance(msg.sender);
        }

        ledger.availableBalance -= amount;
        ledger.totalBalance -= amount;
        payable(msg.sender).transfer(amount);
    }

    function transferFund(address provider, string memory serviceTypeStr, uint amount) external {
        Ledger storage ledger = _get(msg.sender);
        (address servingAddress, IServing serving, uint serviceType) = _getServiceDetails(serviceTypeStr);

        uint transferAmount = amount;
        bytes memory payload;

        if (serving.accountExists(msg.sender, provider)) {
            // If the account already exists, First cancel the amount being retrieved,
            // and if it is insufficient, then transfer the remaining amount.
            uint retrievingAmount = serving.getPendingRefund(msg.sender, provider);
            uint cancelRetrievingAmount = Math.min(amount, retrievingAmount);
            transferAmount -= cancelRetrievingAmount;

            payload = abi.encodeWithSignature(
                "depositFund(address,address,uint256)",
                msg.sender,
                provider,
                cancelRetrievingAmount
            );
        } else {
            // If the account does not exist, add a new account.
            if (serviceType == 0) {
                // Handle inference service
                payload = abi.encodeWithSignature(
                    "addAccount(address,address,uint256[2],string)",
                    msg.sender,
                    provider,
                    ledger.inferenceSigner,
                    ledger.additionalInfo
                );
                ledger.inferenceProviders.push(provider);
            } else {
                // Handle fine-tuning service
                payload = abi.encodeWithSignature(
                    "addAccount(address,address,string)",
                    msg.sender,
                    provider,
                    ledger.additionalInfo
                );
                ledger.fineTuningProviders.push(provider);
            }
        }

        require(ledger.availableBalance >= transferAmount, "Insufficient balance");
        ledger.availableBalance -= transferAmount;

        (bool success, ) = servingAddress.call{value: transferAmount}(payload);
        require(success, "Call to child contract failed");
    }

    function retrieveFund(address[] memory providers, string memory serviceType) external {
        (, IServing serving, ) = _getServiceDetails(serviceType);

        Ledger storage ledger = _get(msg.sender);
        uint totalAmount = 0;

        for (uint i = 0; i < providers.length; i++) {
            (uint amount, , ) = serving.processRefund(msg.sender, providers[i]);
            totalAmount += amount;
            serving.requestRefundAll(msg.sender, providers[i]);
        }
        ledger.availableBalance += totalAmount;
    }

    function deleteLedger() external {
        bytes32 key = _key(msg.sender);
        if (!_contains(key)) {
            revert LedgerNotExists(msg.sender);
        }
        Ledger storage ledger = _get(msg.sender);
        for (uint i = 0; i < ledger.inferenceProviders.length; i++) {
            inferenceAccount.deleteAccount(msg.sender, ledger.inferenceProviders[i]);
        }
        for (uint i = 0; i < ledger.fineTuningProviders.length; i++) {
            fineTuningAccount.deleteAccount(msg.sender, ledger.fineTuningProviders[i]);
        }

        ledgerMap._keys.remove(key);
        delete ledgerMap._values[key];
    }

    function _getServiceDetails(string memory serviceType) private view returns (address, IServing, uint) {
        bytes32 serviceTypeHash = keccak256(abi.encodePacked(serviceType));

        if (serviceTypeHash == keccak256("inference")) {
            return (inferenceAddress, inferenceAccount, 0);
        } else if (serviceTypeHash == keccak256("fine-tuning")) {
            return (fineTuningAddress, fineTuningAccount, 1);
        } else {
            revert("Invalid service type");
        }
    }

    function spendFund(address user, uint amount) external onlyServing {
        Ledger storage ledger = _get(user);
        require((ledger.totalBalance - ledger.availableBalance) >= amount, "Insufficient balance");

        ledger.totalBalance -= amount;
    }

    function _at(uint index) internal view returns (Ledger storage) {
        bytes32 key = ledgerMap._keys.at(index);
        return ledgerMap._values[key];
    }

    function _contains(bytes32 key) internal view returns (bool) {
        return ledgerMap._keys.contains(key);
    }

    function _length() internal view returns (uint) {
        return ledgerMap._keys.length();
    }

    function _get(address user) internal view returns (Ledger storage) {
        bytes32 key = _key(user);
        Ledger storage value = ledgerMap._values[key];
        if (!_contains(key)) {
            revert LedgerNotExists(user);
        }
        return value;
    }

    function _set(
        bytes32 key,
        address user,
        uint[2] calldata inferenceSigner,
        uint balance,
        string memory additionalInfo
    ) internal {
        Ledger storage ledger = ledgerMap._values[key];
        ledger.availableBalance = balance;
        ledger.totalBalance = balance;
        ledger.user = user;
        ledger.inferenceSigner = inferenceSigner;
        ledger.additionalInfo = additionalInfo;
        ledgerMap._keys.add(key);
    }

    function _key(address user) internal pure returns (bytes32) {
        return keccak256(abi.encode(user));
    }

    receive() external payable {}
}
