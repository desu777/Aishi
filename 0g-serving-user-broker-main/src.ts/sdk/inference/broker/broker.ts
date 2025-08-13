import type { AccountStructOutput } from '../contract'
import { InferenceServingContract } from '../contract'
import type { JsonRpcSigner, Wallet } from 'ethers'
import { RequestProcessor } from './request'
import { ResponseProcessor } from './response'
import { Verifier } from './verifier'
import { AccountProcessor } from './account'
import { ModelProcessor } from './model'
import { Cache, Metadata } from '../../common/storage'
import type { LedgerBroker } from '../../ledger'
import { throwFormattedError } from '../../common/utils'

export class InferenceBroker {
    public requestProcessor!: RequestProcessor
    public responseProcessor!: ResponseProcessor
    public verifier!: Verifier
    public accountProcessor!: AccountProcessor
    public modelProcessor!: ModelProcessor

    private signer: JsonRpcSigner | Wallet
    private contractAddress: string
    private ledger: LedgerBroker

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        ledger: LedgerBroker
    ) {
        this.signer = signer
        this.contractAddress = contractAddress
        this.ledger = ledger
    }

    async initialize() {
        let userAddress: string
        try {
            userAddress = await this.signer.getAddress()
        } catch (error) {
            throwFormattedError(error)
        }
        const contract = new InferenceServingContract(
            this.signer,
            this.contractAddress,
            userAddress
        )
        const metadata = new Metadata()
        const cache = new Cache()
        this.requestProcessor = new RequestProcessor(
            contract,
            metadata,
            cache,
            this.ledger
        )
        this.responseProcessor = new ResponseProcessor(
            contract,
            this.ledger,
            metadata,
            cache
        )
        this.accountProcessor = new AccountProcessor(
            contract,
            this.ledger,
            metadata,
            cache
        )
        this.modelProcessor = new ModelProcessor(
            contract,
            this.ledger,
            metadata,
            cache
        )
        this.verifier = new Verifier(contract, this.ledger, metadata, cache)
    }

    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    public listService = async () => {
        try {
            return await this.modelProcessor.listService()
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * Retrieves the account information for a given provider address.
     *
     * @param {string} providerAddress - The address of the provider identifying the account.
     *
     * @returns A promise that resolves to the account information.
     *
     * @throws Will throw an error if the account retrieval process fails.
     */
    public getAccount = async (
        providerAddress: string
    ): Promise<AccountStructOutput> => {
        try {
            return await this.accountProcessor.getAccount(providerAddress)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    public getAccountWithDetail = async (
        providerAddress: string
    ): Promise<
        [AccountStructOutput, { amount: bigint; remainTime: bigint }[]]
    > => {
        try {
            return await this.accountProcessor.getAccountWithDetail(
                providerAddress
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * checks if the user has acknowledged the provider signer.
     *
     * @param {string} providerAddress - The address of the provider.
     * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user
     * has acknowledged the provider signer.
     * @throws Will throw an error if the acknowledgment check fails.
     */
    public userAcknowledged = async (providerAddress: string) => {
        try {
            return await this.requestProcessor.userAcknowledged(providerAddress)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * Acknowledge the given provider address.
     *
     * @param {string} providerAddress - The address of the provider identifying the account.
     *
     *
     * @throws Will throw an error if failed to acknowledge.
     */
    public acknowledgeProviderSigner = async (
        providerAddress: string,
        gasPrice?: number
    ) => {
        try {
            return await this.requestProcessor.acknowledgeProviderSigner(
                providerAddress,
                gasPrice
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * Generates request metadata for the provider service.
     * Includes:
     * 1. Request endpoint for the provider service
     * 2. Model information for the provider service
     *
     * @param {string} providerAddress - The address of the provider.
     *
     * @returns { endpoint, model } - Object containing endpoint and model.
     *
     * @throws An error if errors occur during the processing of the request.
     */
    public getServiceMetadata = async (
        providerAddress: string
    ): Promise<{
        endpoint: string
        model: string
    }> => {
        try {
            return await this.requestProcessor.getServiceMetadata(
                providerAddress
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * getRequestHeaders generates billing-related headers for the request
     * when the user uses the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     * @param {boolean} vllmProxy - Chat signature proxy, default is false
     *
     * @returns headers. Records information such as the request fee and user signature.
     *
     * @example
     *
     * const { endpoint, model } = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     * );
     *
     * const headers = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     *   content,
     * );
     *
     * const openai = new OpenAI({
     *   baseURL: endpoint,
     *   apiKey: "",
     * });
     *
     * const completion = await openai.chat.completions.create(
     *   {
     *     messages: [{ role: "system", content }],
     *     model,
     *   },
     *   headers: {
     *     ...headers,
     *   },
     * );
     *
     * @throws An error if errors occur during the processing of the request.
     */
    public getRequestHeaders = async (
        providerAddress: string,
        content: string,
        vllmProxy?: boolean
    ) => {
        try {
            return await this.requestProcessor.getRequestHeaders(
                providerAddress,
                content,
                vllmProxy
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * processResponse is used after the user successfully obtains a response from the provider service.
     *
     * It will settle the fee for the response content. Additionally, if the service is verifiable,
     * input the chat ID from the response and processResponse will determine the validity of the
     * returned content by checking the provider service's response and corresponding signature associated
     * with the chat ID.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} content - The main content returned by the service. For example, in the case of a chatbot service,
     * it would be the response text.
     * @param {string} chatID - Only for verifiable services. You can provide the chat ID obtained from the response to
     * automatically download the response signature. The function will verify the reliability of the response
     * using the service's signing address.
     * @param {boolean} vllmProxy - Chat signature proxy, default is true
     *
     * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
     *
     * @throws An error if any issues occur during the processing of the response.
     */
    public processResponse = async (
        providerAddress: string,
        content: string,
        chatID?: string,
        vllmProxy?: boolean
    ): Promise<boolean | null> => {
        try {
            return await this.responseProcessor.processResponse(
                providerAddress,
                content,
                chatID,
                vllmProxy
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param {string} providerAddress - The address of the provider.
     *
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     *
     * @throws An error if errors occur during the verification process.
     */
    public verifyService = async (
        providerAddress: string
    ): Promise<boolean | null> => {
        try {
            return await this.verifier.verifyService(providerAddress)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * getSignerRaDownloadLink returns the download link for the Signer RA.
     *
     * It can be provided to users who wish to manually verify the Signer RA.
     *
     * @param {string} providerAddress - provider address.
     *
     * @returns Download link.
     */
    public getSignerRaDownloadLink = async (providerAddress: string) => {
        try {
            return await this.verifier.getSignerRaDownloadLink(providerAddress)
        } catch (error) {
            throwFormattedError(error)
        }
    }

    /**
     * getChatSignatureDownloadLink returns the download link for the signature of a single chat.
     *
     * It can be provided to users who wish to manually verify the content of a single chat.
     *
     * @param {string} providerAddress - provider address.
     * @param {string} chatID - ID of the chat.
     *
     * @remarks To verify the chat signature, use the following code:
     *
     * ```typescript
     * const messageHash = ethers.hashMessage(messageToBeVerified)
     * const recoveredAddress = ethers.recoverAddress(messageHash, signature)
     * const isValid = recoveredAddress.toLowerCase() === signingAddress.toLowerCase()
     * ```
     *
     * @returns Download link.
     */
    public getChatSignatureDownloadLink = async (
        providerAddress: string,
        chatID: string
    ) => {
        try {
            return await this.verifier.getChatSignatureDownloadLink(
                providerAddress,
                chatID
            )
        } catch (error) {
            throwFormattedError(error)
        }
    }
}

/**
 * createInferenceBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createInferenceBroker(
    signer: JsonRpcSigner | Wallet,
    contractAddress: string,
    ledger: LedgerBroker
): Promise<InferenceBroker> {
    const broker = new InferenceBroker(signer, contractAddress, ledger)
    try {
        await broker.initialize()
        return broker
    } catch (error) {
        throw error
    }
}
