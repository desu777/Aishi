import type { AccountStructOutput } from '../contract'
import { ZGServingUserBrokerBase } from './base'
import type { AddressLike } from 'ethers'
import { throwFormattedError } from '../../common/utils'

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(provider: AddressLike) {
        try {
            return await this.contract.getAccount(provider)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async getAccountWithDetail(
        provider: AddressLike
    ): Promise<
        [AccountStructOutput, { amount: bigint; remainTime: bigint }[]]
    > {
        try {
            const [account, lockTime] = await Promise.all([
                this.contract.getAccount(provider),
                this.contract.lockTime(),
            ])
            const now = BigInt(Math.floor(Date.now() / 1000))
            const refunds = account.refunds
                .filter((refund) => !refund.processed)
                .filter((refund) => refund.amount !== BigInt(0))
                .map((refund) => ({
                    amount: refund.amount,
                    remainTime: lockTime - (now - refund.createdAt),
                }))

            return [account, refunds]
        } catch (error) {
            throwFormattedError(error)
        }
    }

    async listAccount() {
        try {
            return await this.contract.listAccount()
        } catch (error) {
            throwFormattedError(error)
        }
    }
}
