import type { JsonRpcSigner, AddressLike, Wallet, BigNumberish } from 'ethers'
import { InferenceServing__factory } from './typechain'
import type { InferenceServing } from './typechain/InferenceServing'
import type { ServiceStructOutput } from './typechain/InferenceServing'
import { throwFormattedError } from '../../common/utils'

export class InferenceServingContract {
    public serving: InferenceServing
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = InferenceServing__factory.connect(
            contractAddress,
            signer
        )
        this.signer = signer
        this._userAddress = userAddress
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    async listService(): Promise<ServiceStructOutput[]> {
        try {
            const services = await this.serving.getAllServices()
            return services
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts()
            return accounts
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async getAccount(provider: AddressLike) {
        try {
            const user = this.getUserAddress()
            const account = await this.serving.getAccount(user, provider)
            return account
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async acknowledgeProviderSigner(
        providerAddress: AddressLike,
        providerSigner: [BigNumberish, BigNumberish]
    ) {
        try {
            const tx = await this.serving.acknowledgeProviderSigner(
                providerAddress,
                providerSigner
            )

            const receipt = await tx.wait()
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async getService(providerAddress: string): Promise<ServiceStructOutput> {
        try {
            return this.serving.getService(providerAddress)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    getUserAddress(): string {
        return this._userAddress
    }
}
