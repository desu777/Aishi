// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

struct Account {
    address user;
    address provider;
    uint nonce;
    uint balance;
    uint pendingRefund;
    uint[2] signer;
    Refund[] refunds;
    string additionalInfo;
    uint[2] providerPubKey;
}

struct Refund {
    uint index;
    uint amount;
    uint createdAt;
    bool processed;
}

library AccountLibrary {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error AccountNotExists(address user, address provider);
    error AccountExists(address user, address provider);
    error InsufficientBalance(address user, address provider);
    error RefundInvalid(address user, address provider, uint index);
    error RefundProcessed(address user, address provider, uint index);
    error RefundLocked(address user, address provider, uint index);

    struct AccountMap {
        EnumerableSet.Bytes32Set _keys;
        mapping(bytes32 => Account) _values;
    }

    function getAccount(
        AccountMap storage map,
        address user,
        address provider
    ) internal view returns (Account storage) {
        return _get(map, user, provider);
    }

    function getAllAccounts(AccountMap storage map) internal view returns (Account[] memory accounts) {
        uint len = _length(map);
        accounts = new Account[](len);

        for (uint i = 0; i < len; i++) {
            accounts[i] = _at(map, i);
        }
    }

    function accountExists(AccountMap storage map, address user, address provider) internal view returns (bool) {
        return _contains(map, _key(user, provider));
    }

    function getPendingRefund(AccountMap storage map, address user, address provider) internal view returns (uint) {
        Account storage account = _get(map, user, provider);
        return account.pendingRefund;
    }

    function addAccount(
        AccountMap storage map,
        address user,
        address provider,
        uint[2] calldata signer,
        uint amount,
        string memory additionalInfo
    ) internal returns (uint, uint) {
        bytes32 key = _key(user, provider);
        if (_contains(map, key)) {
            revert AccountExists(user, provider);
        }
        _set(map, key, user, provider, signer, amount, additionalInfo);
        return (amount, 0);
    }

    function deleteAccount(AccountMap storage map, address user, address provider) internal {
        bytes32 key = _key(user, provider);
        if (!_contains(map, key)) {
            return;
        }
        map._keys.remove(key);
        delete map._values[key];
    }

    function acknowledgeProviderSigner(
        AccountMap storage map,
        address user,
        address provider,
        uint[2] calldata providerPubKey
    ) internal {
        if (!_contains(map, _key(user, provider))) {
            revert AccountNotExists(user, provider);
        }
        Account storage account = _get(map, user, provider);
        account.providerPubKey = providerPubKey;
    }

    function depositFund(
        AccountMap storage map,
        address user,
        address provider,
        uint cancelRetrievingAmount,
        uint amount
    ) internal returns (uint, uint) {
        bytes32 key = _key(user, provider);
        if (!_contains(map, key)) {
            revert AccountNotExists(user, provider);
        }
        Account storage account = _get(map, user, provider);

        for (uint i = 0; i < account.refunds.length; i++) {
            Refund storage refund = account.refunds[i];
            if (refund.processed) {
                continue;
            }
            account.pendingRefund -= refund.amount;
            if (cancelRetrievingAmount <= refund.amount) {
                delete account.refunds[i];
                break;
            }
            cancelRetrievingAmount -= refund.amount;
            delete account.refunds[i];
        }

        account.balance += amount;
        return (account.balance, account.pendingRefund);
    }

    function requestRefundAll(AccountMap storage map, address user, address provider) internal {
        Account storage account = _get(map, user, provider);
        uint amount = account.balance - account.pendingRefund;
        if (amount == 0) {
            return;
        }
        account.refunds.push(Refund(account.refunds.length, amount, block.timestamp, false));
        account.pendingRefund += amount;
    }

    function processRefund(
        AccountMap storage map,
        address user,
        address provider,
        uint lockTime
    ) internal returns (uint totalAmount, uint balance, uint pendingRefund) {
        Account storage account = _get(map, user, provider);
        totalAmount = 0;

        for (uint i = 0; i < account.refunds.length; i++) {
            Refund storage refund = account.refunds[i];
            if (refund.processed) {
                continue;
            }
            if (block.timestamp < refund.createdAt + lockTime) {
                continue;
            }
            account.balance -= refund.amount;
            account.pendingRefund -= refund.amount;
            totalAmount += refund.amount;
            delete account.refunds[i];
        }

        balance = account.balance;
        pendingRefund = account.pendingRefund;
    }

    function _at(AccountMap storage map, uint index) internal view returns (Account storage) {
        bytes32 key = map._keys.at(index);
        return map._values[key];
    }

    function _contains(AccountMap storage map, bytes32 key) internal view returns (bool) {
        return map._keys.contains(key);
    }

    function _length(AccountMap storage map) internal view returns (uint) {
        return map._keys.length();
    }

    function _get(AccountMap storage map, address user, address provider) internal view returns (Account storage) {
        bytes32 key = _key(user, provider);
        Account storage value = map._values[key];
        if (!_contains(map, key)) {
            revert AccountNotExists(user, provider);
        }
        return value;
    }

    function _set(
        AccountMap storage map,
        bytes32 key,
        address user,
        address provider,
        uint[2] calldata signer,
        uint balance,
        string memory additionalInfo
    ) internal {
        Account storage account = map._values[key];
        account.balance = balance;
        account.user = user;
        account.provider = provider;
        account.signer = signer;
        account.additionalInfo = additionalInfo;
        map._keys.add(key);
    }

    function _key(address user, address provider) internal pure returns (bytes32) {
        return keccak256(abi.encode(user, provider));
    }
}
