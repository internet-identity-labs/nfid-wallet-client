import { HttpAgent, SignIdentity } from "@dfinity/agent"
import {
  CkETHMinterCanister,
  encodePrincipalToEthAddress,
} from "@dfinity/cketh"
import { Account } from "@dfinity/ledger-icp"
import { ApproveParams, IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { TransferArg } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger"
import { Principal } from "@dfinity/principal"
import {
  Contract,
  Interface,
  InfuraProvider,
  parseEther,
  TransactionRequest,
  type FeeData,
  type TransactionResponse,
} from "ethers"
import { ttlCacheService } from "@nfid/client-db"
import { agentBaseConfig } from "packages/integration/src/lib/actors"

import { transferICRC1 } from "@nfid/integration/token/icrc1"

import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import {
  Address,
  Balance,
  chainFusionSignerService,
} from "../bitcoin/services/chain-fusion-signer.service"
import { patronService } from "../bitcoin/services/patron.service"
import { CKETH_ABI } from "./cketh.constants"
import { getWalletDelegation } from "../facade/wallet"
import {
  MINTER_ADDRESS,
  CKETH_MINTER_CANISTER_ID,
  CKETH_NETWORK_FEE,
  INFURA_API_KEY,
  CHAIN_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { KEY_ETH_ADDRESS } from "packages/integration/src/lib/authentication/storage"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { MORALIS_API_KEY } from "src/integration/nft/impl/evm/evm-nft-floor-price.service"

export type EvmNftStandard = "ERC-721" | "ERC-1155" | "ERC-404"

export type SendEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
}

export type CkEthToEthFee = {
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
  identityLabsFee: bigint
}

export type EthToCkEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
}

export interface EvmNftMetadata {
  name?: string
  description?: string
  image?: string
  image_url?: string
  external_url?: string
  attributes?: Array<{ trait_type: string; value: string }>
}

export interface EvmNftAsset {
  contract: string
  tokenId: string
  supply: string
  type: EvmNftStandard
  metadata?: EvmNftMetadata
  imageUrl?: string
  animationUrl?: string
  tokenName?: string
  tokenSymbol?: string
  chainId: number
  acquiredAt?: number
}

// ─── Moralis NFT API ──────────────────────────────────────────────────────────

const MORALIS_CHAIN_MAP: Partial<Record<number, string>> = {
  [ChainId.ETH]: "eth",
  [ChainId.BASE]: "base",
  [ChainId.POL]: "polygon",
  [ChainId.ARB]: "arbitrum",
  [ChainId.BNB]: "bsc",
}

interface MoralisNftItem {
  token_address: string
  token_id: string
  contract_type: string
  amount?: string
  name?: string
  symbol?: string
  normalized_metadata?: {
    name?: string
    description?: string
    image?: string
    animation_url?: string
    attributes?: Array<{ trait_type: string; value: string }>
  }
  media?: { original_media_url?: string }
}

interface MoralisNftResponse {
  result: MoralisNftItem[]
  cursor?: string | null
}

interface MoralisTransferItem {
  block_timestamp: string
  token_address: string
  token_id: string
  to_address?: string
}

interface MoralisTransfersResponse {
  result: MoralisTransferItem[]
  cursor?: string | null
}

function normalizeMoralisType(contractType: string): EvmNftStandard {
  switch (contractType.toUpperCase()) {
    case "ERC1155":
      return "ERC-1155"
    case "ERC404":
      return "ERC-404"
    default:
      return "ERC-721"
  }
}

function resolveIpfsUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`
  }
  return url
}

const EVM_NFTS_CACHE_TTL = 30 * 1000
export const EVM_NFTS_CACHE_NAME = "EVM_NFTS_"
export const EVM_BALANCE_CACHE_NAME = "EVM_BALANCE_"

const ERC721_TRANSFER_IFACE = new Interface([
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
])
const ERC1155_TRANSFER_IFACE = new Interface([
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
])

export abstract class EVMService {
  protected provider: InfuraProvider

  constructor() {
    this.provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
  }

  public async getQuickAddress() {
    const { cachedValue } = this.getAddressFromCache()

    if (cachedValue == null) {
      const identity = await getWalletDelegation()
      return this.getAddress(identity)
    } else {
      return cachedValue as string
    }
  }

  //get eth address from global identity
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = this.getAddressFromCache()

    if (cachedValue != null) {
      return cachedValue as string
    }
    await patronService.askToPayFor(identity)

    const address = await chainFusionSignerService.getEthAddress(identity)
    localStorage.setItem(key, address)
    return address
  }

  //get balance of eth address
  public async getBalance(address: Address): Promise<Balance> {
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const cacheKey = `${EVM_BALANCE_CACHE_NAME}${chainId}_${address.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.provider.getBalance(address),
      () => 20000 + Math.floor(Math.random() * 10000),
      {
        serialize: (v) => v.toString(),
        deserialize: (v) => BigInt(v as string) as Balance,
        onBackgroundError: (error) =>
          console.error("Failed to refresh balance cache:", error),
      },
    )
  }

  public async getNFTs(address: string): Promise<EvmNftAsset[]> {
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const chain = MORALIS_CHAIN_MAP[chainId]
    if (!chain) return []

    const cacheKey = `${EVM_NFTS_CACHE_NAME}${chainId}_${address.toLowerCase()}`

    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchNFTs(address, chain, chainId),
      EVM_NFTS_CACHE_TTL,
      {
        onBackgroundError: (error) =>
          console.error("Failed to refresh EVM NFTs cache:", error),
      },
    )
  }

  private async fetchNFTs(
    address: string,
    chain: string,
    chainId: number,
  ): Promise<EvmNftAsset[]> {
    const nfts = await this.fetchNFTList(address, chain, chainId)
    if (nfts.length === 0) return nfts

    const ownedKeys = new Set(
      nfts.map((n) => `${n.contract.toLowerCase()}:${n.tokenId}`),
    )
    const timestamps = await this.fetchNFTTimestamps(
      address,
      chain,
      ownedKeys,
    ).catch(() => new Map<string, number>())

    return nfts.map((nft) => ({
      ...nft,
      acquiredAt: timestamps.get(
        `${nft.contract.toLowerCase()}:${nft.tokenId}`,
      ),
    }))
  }

  private async fetchNFTList(
    address: string,
    chain: string,
    chainId: number,
  ): Promise<EvmNftAsset[]> {
    const results: EvmNftAsset[] = []
    let cursor: string | null = null

    do {
      const url = new URL(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft`,
      )
      url.searchParams.set("chain", chain)
      url.searchParams.set("format", "decimal")
      url.searchParams.set("normalizeMetadata", "true")
      url.searchParams.set("excludeSpam", "false")
      url.searchParams.set("limit", "100")
      if (cursor) url.searchParams.set("cursor", cursor)

      const response = await fetch(url.toString(), {
        headers: { "X-API-Key": MORALIS_API_KEY },
      })
      if (!response.ok) {
        throw new Error(
          `Moralis NFT API error: ${response.status} ${response.statusText}`,
        )
      }

      const data: MoralisNftResponse = await response.json()

      for (const item of data.result) {
        results.push({
          contract: item.token_address,
          tokenId: item.token_id,
          supply: item.amount ?? "1",
          type: normalizeMoralisType(item.contract_type),
          metadata: item.normalized_metadata as EvmNftMetadata | undefined,
          imageUrl: resolveIpfsUrl(
            item.normalized_metadata?.image ?? item.media?.original_media_url,
          ),
          animationUrl: resolveIpfsUrl(item.normalized_metadata?.animation_url),
          tokenName: item.name,
          tokenSymbol: item.symbol,
          chainId,
        })
      }

      cursor = data.cursor ?? null
    } while (cursor)

    return results
  }

  private async fetchNFTTimestamps(
    address: string,
    chain: string,
    ownedKeys: Set<string>,
  ): Promise<Map<string, number>> {
    const timestamps = new Map<string, number>()
    const remaining = new Set(ownedKeys)
    let cursor: string | null = null

    do {
      const url = new URL(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers`,
      )
      url.searchParams.set("chain", chain)
      url.searchParams.set("format", "decimal")
      url.searchParams.set("limit", "100")
      if (cursor) url.searchParams.set("cursor", cursor)

      const response = await fetch(url.toString(), {
        headers: { "X-API-Key": MORALIS_API_KEY },
      })
      if (!response.ok) break

      const data: MoralisTransfersResponse = await response.json()

      for (const item of data.result) {
        if (item.to_address?.toLowerCase() !== address.toLowerCase()) continue
        const key = `${item.token_address.toLowerCase()}:${item.token_id}`
        if (remaining.has(key) && !timestamps.has(key)) {
          timestamps.set(key, new Date(item.block_timestamp).getTime())
          remaining.delete(key)
        }
      }

      cursor = data.cursor ?? null
    } while (cursor && remaining.size > 0)

    return timestamps
  }

  public async getQuickBalance(): Promise<Balance> {
    const { cachedValue } = this.getAddressFromCache()

    if (!cachedValue) {
      throw Error("No ethereum address in a cache.")
    }

    return await this.getBalance(cachedValue as Address)
  }

  //retrieve fee data from provider
  private async getFeeData(): Promise<FeeData> {
    const feeData = await this.provider.getFeeData()
    return feeData
  }

  //estimate gas for transaction
  private async estimateGas({
    to,
    from,
    value,
    data,
  }: TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      value,
      from,
      data,
    })
  }

  //deposit eth to ckETH
  public async convertToCkEth(
    identity: SignIdentity,
    amount: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ) {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)

    const address = await this.getAddress(identity)

    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    const subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    const trs = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount) },
    )
    const nonce = await this.getTransactionCount(address)

    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)

    const trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: parseEther(amount),
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
      chain_id: BigInt(chainId),
    }
    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    const response = await this.sendTransaction(signedTransaction)
    return response
  }

  private getIdentityLabsFee(parsedAmount: bigint): bigint {
    return (parsedAmount * BigInt(875)) / BigInt(10000000000)
  }

  //convert ckETH to eth
  public async convertFromCkEth(
    address: Address,
    amount: string,
    identity: SignIdentity,
  ) {
    const parsedAmount = parseEther(amount)
    //we take 0.0000875% ckETH as fee
    const identityLabsFee: bigint = this.getIdentityLabsFee(parsedAmount)

    //Minimum amount 0.03 ckETH
    if (parsedAmount < BigInt(30000000000000000)) {
      throw new Error("The minimum amount for conversion is 0.03 ckETH")
    }

    await this.approveTransfer(
      CKETH_LEDGER_CANISTER_ID,
      CKETH_MINTER_CANISTER_ID,
      parsedAmount,
      identity,
    )

    const agent = new HttpAgent({
      ...agentBaseConfig,
      identity: identity,
    })

    const ckEthMinter = CkETHMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKETH_MINTER_CANISTER_ID),
    })

    const result = await ckEthMinter.withdrawEth({
      address,
      amount: parsedAmount,
    })

    const transferArgs: TransferArg = {
      amount: identityLabsFee,
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET_CANISTER),
      },
    }

    transferICRC1(identity, CKETH_LEDGER_CANISTER_ID, transferArgs)

    return result
  }

  public async getSendEthFee(
    to: Address,
    from: Address,
    value: string,
  ): Promise<SendEthFee> {
    const gasUsed = await this.estimateGas({
      to,
      from,
      value: parseEther(value),
    })

    const feeData = await this.getFeeData()
    if (
      feeData.maxFeePerGas === null ||
      feeData.maxPriorityFeePerGas === null
    ) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()

    const ethereumNetworkFee = this.estimateTransaction(
      gasUsed,
      feeData.maxFeePerGas,
    )

    return {
      gasUsed,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
    }
  }

  public async getEthToCkEthFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<EthToCkEthFee> {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)
    const fromAddress = await this.getAddress(identity)
    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    const subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    const txRequest = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount.toString()) },
    )

    const gasEstimate = await this.estimateGas({
      to: txRequest.to,
      from: fromAddress,
      value: txRequest.value,
      data: txRequest.data,
    })

    const feeData = await this.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)

    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      gasUsed: gasEstimate,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
      amountToReceive:
        parseEther(amount.toString()) - ethereumNetworkFee - CKETH_NETWORK_FEE,
      icpNetworkFee: CKETH_NETWORK_FEE,
    }
  }

  public async getCkEthToEthFee(
    to: string,
    amount: string,
  ): Promise<CkEthToEthFee> {
    const parsedAmount = parseEther(amount.toString())
    const identityLabsFee = this.getIdentityLabsFee(parsedAmount)
    const amountToReceive = parsedAmount - identityLabsFee - CKETH_NETWORK_FEE

    const gasEstimate = await this.estimateGas({
      to,
      value: parsedAmount,
    })

    const feeData = await this.provider.getFeeData()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)
    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      ethereumNetworkFee,
      amountToReceive,
      icpNetworkFee: CKETH_NETWORK_FEE * BigInt(2),
      identityLabsFee,
    }
  }

  private estimateTransaction(gas: bigint, maxFeePerGas: bigint): bigint {
    return gas * maxFeePerGas
  }

  //transfer eth
  public async sendEthTransaction(
    identity: SignIdentity,
    to: Address,
    value: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
    chainId: ChainId,
  ): Promise<TransactionResponse> {
    const address = await this.getAddress(identity)

    const nonce = await this.getTransactionCount(address)

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: to,
      value: parseEther(value),
      data: [],
      nonce: BigInt(nonce),
      gas: gas?.gasUsed,
      max_priority_fee_per_gas: gas?.maxPriorityFeePerGas,
      max_fee_per_gas: gas?.maxFeePerGas,
    }

    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )

    return await this.sendTransaction(signedTransaction)
  }

  public async getNFTTransferFee(
    from: Address,
    to: Address,
    asset: Pick<EvmNftAsset, "contract" | "tokenId" | "type">,
  ): Promise<SendEthFee> {
    const data = this.buildNFTTransferData(from, to, asset)

    let gasUsed: bigint
    try {
      gasUsed = await this.estimateGas({
        from,
        to: asset.contract as Address,
        data,
      })
    } catch {
      gasUsed = asset.type === "ERC-1155" ? BigInt(150_000) : BigInt(100_000)
    }

    const feeData = await this.getFeeData()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas ?? BigInt(2_000_000_000)
    const maxFeePerGas =
      feeData.maxFeePerGas ?? maxPriorityFeePerGas + BigInt(5_000_000_000)

    const baseFee = await this.getBaseFee()

    return {
      gasUsed,
      maxPriorityFeePerGas,
      maxFeePerGas,
      baseFeePerGas: baseFee,
      ethereumNetworkFee: this.estimateTransaction(gasUsed, maxFeePerGas),
    }
  }

  public async sendNFTTransaction(
    identity: SignIdentity,
    to: Address,
    asset: Pick<EvmNftAsset, "contract" | "tokenId" | "type">,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ): Promise<TransactionResponse> {
    const from = await this.getAddress(identity)
    const network = await this.provider.getNetwork()
    const chainId = Number(network.chainId)
    const nonce = await this.getTransactionCount(from)
    const data = this.buildNFTTransferData(from, to, asset)

    const request: EthSignTransactionRequest = {
      chain_id: BigInt(chainId),
      to: asset.contract,
      value: BigInt(0),
      data: [data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
    }

    const signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )
    return this.sendTransaction(signedTransaction)
  }

  private buildNFTTransferData(
    from: Address,
    to: Address,
    asset: Pick<EvmNftAsset, "tokenId" | "type">,
  ): string {
    const tokenId = BigInt(asset.tokenId)
    if (asset.type === "ERC-1155") {
      return ERC1155_TRANSFER_IFACE.encodeFunctionData("safeTransferFrom", [
        from,
        to,
        tokenId,
        BigInt(1),
        "0x",
      ])
    }
    return ERC721_TRANSFER_IFACE.encodeFunctionData("safeTransferFrom", [
      from,
      to,
      tokenId,
    ])
  }

  private getAddressFromCache() {
    const cachedValue = localStorage.getItem(KEY_ETH_ADDRESS)

    return {
      cachedValue,
      key: KEY_ETH_ADDRESS,
    }
  }

  private async approveTransfer(
    ledgerCanisterId: string,
    minterCanisterId: string,
    amount: bigint,
    identity: SignIdentity,
  ): Promise<bigint> {
    const ledger = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(ledgerCanisterId),
      agent: new HttpAgent({
        ...agentBaseConfig,
        identity: identity,
      }),
    })
    const spender: Account = {
      owner: Principal.fromText(minterCanisterId),
      subaccount: [],
    }
    const params: ApproveParams = {
      spender,
      amount,
    }
    const icrc2approve = await ledger.approve(params)

    return BigInt(icrc2approve)
  }

  public async getTransactionCount(address: Address): Promise<number> {
    const transactionCount = await this.provider.getTransactionCount(address)
    return transactionCount
  }

  public async ethPersonalSign(
    identity: SignIdentity,
    message: string,
  ): Promise<string> {
    return await chainFusionSignerService.ethPersonalSign(identity, message)
  }

  private async getBaseFee() {
    const block = await this.provider.getBlock("latest")
    return block?.baseFeePerGas ?? BigInt(0)
  }

  private async sendTransaction(
    signedTransaction: string,
  ): Promise<TransactionResponse> {
    try {
      const response =
        await this.provider.broadcastTransaction(signedTransaction)
      await response.wait()
      return response
    } catch (e) {
      throw e
    }
  }
}
