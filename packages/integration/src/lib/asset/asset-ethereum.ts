import { DelegationIdentity } from "@dfinity/identity"
import { TransactionResponse } from "@ethersproject/abstract-provider"
import {
  Activity as RaribleActivity,
  ActivitySort,
  ActivityType,
  OrderMatchSell,
  TransferActivity,
  UserActivityType,
  ItemId,
} from "@rarible/api-client"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk, IRaribleSdk } from "@rarible/sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import {
  convertEthereumItemId,
  convertEthereumToUnionAddress,
} from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toItemId } from "@rarible/types"
import { toCurrencyId, UnionAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  OwnedNftsResponse as AlchemyOwnedNftsResponse,
  SortingOrder,
} from "alchemy-sdk"
import { ethers } from "ethers-ts"
import { principalToAddress } from "ictool"

import { EthWallet } from "../ecdsa-signer/ecdsa-wallet"
import { EthWalletV2 } from "../ecdsa-signer/signer-ecdsa"
import { getPriceFull } from "./asset-util"
import { NonFungibleAsset } from "./non-fungible-asset"
import { coinbaseRatesService } from "./service/coinbase-rates.service"
import { estimateTransaction } from "./service/estimate-transaction.service"
import {
  ActivitiesByItemRequest,
  ActivitiesByUserRequest,
  ActivityRecord,
  Address,
  ChainBalance,
  Configuration,
  Erc20TokensByUserRequest,
  EstimateTransactionRequest,
  EstimatedTransaction,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleTxs,
  Identity,
  ItemsByUserRequest,
  NonFungibleActivityRecords,
  NonFungibleItems,
  Token,
  TokenBalanceSheet,
  Tokens,
  TransferETHRequest,
  TransferNftRequest,
  TransferResponse,
} from "./types"

function removeChain(id: UnionAddress): string {
  return id.slice(id.indexOf(":") + 1)
}

export class EthereumAsset extends NonFungibleAsset<TransferResponse> {
  private readonly config: Configuration

  constructor(config: Configuration) {
    super()
    this.config = config
  }

  getBlockchain(): string {
    return this.config.blockchainName
  }

  getNativeCurrency(): string {
    return this.config.symbol
  }

  getNativeToken(): string {
    return this.config.token
  }

  async transfer(
    identity: DelegationIdentity,
    transaction: ethers.providers.TransactionRequest,
  ): Promise<TransferResponse> {
    const wallet = this.getWallet(identity, this.config.providerUrl)
    const etherscanUrl = this.config.etherscanUrl
    const chainId = await wallet.getChainId()
    const rate = await coinbaseRatesService.getRateByChainId(chainId)
    const response = await wallet.sendTransaction(transaction)
    return {
      etherscanTransactionUrl: `${etherscanUrl}${response.hash}`,
      time: 600, // It's a hardcoded value as 10 minutes, we don't know how to calculate the time yet.
      waitOnChain: response.wait().then(({ effectiveGasPrice, gasUsed }) => {
        const fee = effectiveGasPrice.mul(gasUsed)
        const feeFormatted = ethers.utils.formatEther(fee)
        const feeInUSD = parseFloat(feeFormatted) * rate
        return { total: feeFormatted, totalUSD: feeInUSD.toFixed(2) }
      }),
    }
  }

  async getEstimatedTransaction(
    request: EstimateTransactionRequest,
  ): Promise<EstimatedTransaction> {
    const wallet = this.getWallet(request.identity, this.config.providerUrl)
    return estimateTransaction(wallet, request)
  }

  public async getAddress(delegation?: DelegationIdentity): Promise<string> {
    if (!delegation) {
      throw Error("Delegation is needed.")
    }
    const wallet = this.getWallet(delegation, this.config.providerUrl)
    return await wallet.getAddress()
  }

  public async getActivitiesByItem({
    tokenId,
    contract,
    cursor,
    sort,
    size,
  }: ActivitiesByItemRequest): Promise<NonFungibleActivityRecords> {
    const raribleSdk = this.getRaribleSdk(
      this.config.raribleEnv,
      this.config.raribleApiKey,
    )
    const itemId = convertEthereumItemId(
      `${contract}:${tokenId}`,
      this.config.blockchain,
    )
    const raribleActivities =
      await raribleSdk.apis.activity.getActivitiesByItem({
        type: [ActivityType.SELL, ActivityType.TRANSFER],
        itemId,
        cursor,
        size,
        sort:
          "asc" === sort
            ? ActivitySort.EARLIEST_FIRST
            : ActivitySort.LATEST_FIRST,
      })

    return {
      activities: raribleActivities.activities.map(this.mapActivity),
      cursor: raribleActivities.cursor,
    }
  }

  public async getActivitiesByUser({
    identity,
    cursor,
    size,
    sort,
  }: ActivitiesByUserRequest): Promise<NonFungibleActivityRecords> {
    const address = await this.getAddressByIdentity(identity)
    const raribleSdk = this.getRaribleSdk(
      this.config.raribleEnv,
      this.config.raribleApiKey,
    )
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      this.config.unionBlockchain,
    )
    const raribleActivities =
      await raribleSdk.apis.activity.getActivitiesByUser({
        type: [
          UserActivityType.SELL,
          UserActivityType.TRANSFER_FROM,
          UserActivityType.TRANSFER_TO,
          UserActivityType.BUY,
        ],
        user: [unionAddress],
        cursor,
        size,
        blockchains: [this.config.blockchain],
        sort:
          "asc" === sort
            ? ActivitySort.EARLIEST_FIRST
            : ActivitySort.LATEST_FIRST,
      })
    return {
      activities: raribleActivities.activities.map(this.mapActivity),
      cursor: raribleActivities.cursor,
    }
  }

  public async getItemsByUser({
    identity,
    cursor,
    size,
  }: ItemsByUserRequest): Promise<NonFungibleItems> {
    const address = await this.getAddressByIdentity(identity)
    const alchemySdk = this.getAlchemySdk(
      this.config.alchemyNetwork,
      this.config.alchemyApiKey,
    )
    const raribleSdk = this.getRaribleSdk(
      this.config.raribleEnv,
      this.config.raribleApiKey,
    )
    const tokens: AlchemyOwnedNftsResponse =
      await alchemySdk.nft.getNftsForOwner(address, {
        pageKey: cursor,
        pageSize: size,
        omitMetadata: false,
      })

    const chain = this.config.blockchain.toString()
    const ids: Array<ItemId> = tokens.ownedNfts.map((item) => {
      const contract = item.contract.address
      const id = `${chain}:${contract}:${item.tokenId}`
      return toItemId(id)
    })

    const contentUrlById: Map<string, string> = await raribleSdk.apis.item
      .getItemByIds({ itemIds: { ids } })
      .then((x) => {
        return x.items.reduce((acc, val) => {
          const contentUrl = val.meta?.content[0]?.url
          acc.set(val.id, contentUrl)
          return acc
        }, new Map())
      })

    return {
      total: tokens.totalCount,
      items: tokens.ownedNfts.map((item) => {
        const contract = item.contract.address
        const id = `${chain}:${contract}:${item.tokenId}`
        const image = contentUrlById.get(id)
        return {
          id,
          blockchain: chain,
          collection: contract,
          contract: contract,
          tokenId: item.tokenId,
          lastUpdatedAt: item.timeLastUpdated,
          thumbnail: item.media[0]?.thumbnail ?? image ?? "",
          image: image ?? item.media[0]?.gateway ?? "",
          title: item.title,
          description: item.description,
          tokenType: item.tokenType.toString(),
          contractName: item.contract.name,
          contractSymbol: item.contract.symbol,
        }
      }),
    }
  }

  public async getBalance(
    address?: string,
    delegation?: DelegationIdentity,
  ): Promise<ChainBalance> {
    const addressVal = await this.getAddressByIdentity(
      address ?? delegation ?? undefined,
    )
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      addressVal,
      this.config.unionBlockchain,
    )
    const raribleSdk = this.getRaribleSdk(
      this.config.raribleEnv,
      this.config.raribleApiKey,
    )
    const now = new Date()
    const [balance, currencyRate] = await Promise.all([
      raribleSdk.balances.getBalance(
        unionAddress,
        toCurrencyId(this.config.currencyId),
      ),
      raribleSdk.apis.currency.getCurrencyUsdRateByCurrencyId({
        currencyId: this.config.currencyId,
        at: now,
      }),
    ])

    const balanceInString =
      balance.toString().length > 9
        ? parseFloat(balance.toString()).toFixed(8)
        : balance.toString()
    const balanceinUsd = parseFloat(
      toBn(currencyRate.rate).multipliedBy(balance).toString(),
    ).toFixed(2)
    return { balance: balanceInString, balanceinUsd }
  }

  public async transferNft({
    delegation,
    tokenId,
    contract,
    receiver,
  }: TransferNftRequest): Promise<void> {
    const wallet = this.getWallet(delegation, this.config.providerUrl)
    return await wallet.safeTransferFrom(receiver, contract, tokenId)
  }

  public async transferETH({
    delegation,
    to,
    amount,
  }: TransferETHRequest): Promise<TransactionResponse> {
    const wallet = this.getWallet(delegation, this.config.providerUrl)
    const address = await wallet.getAddress()
    // const trCount = await this.wallet.getTransactionCount("latest")
    // const gasPrice = await this.wallet.getGasPrice()
    // const gasLimit = BigNumber.from(100000)

    new EthWallet().sendTransaction
    const transaction = {
      from: address,
      to: to,
      value: ethers.utils.parseEther(amount),
      // nonce: trCount,
      // gasLimit: gasLimit,
      // gasPrice: gasPrice,
    }

    return wallet.sendTransaction(transaction)
  }

  public async getErc20TokensByUser({
    identity,
    cursor,
  }: Erc20TokensByUserRequest): Promise<Tokens> {
    const address = await this.getAddressByIdentity(identity)
    const alchemySdk = this.getAlchemySdk(
      this.config.alchemyNetwork,
      this.config.alchemyApiKey,
    )
    const tokens = await alchemySdk.core.getTokensForOwner(address, {
      pageKey: cursor,
    })
    const price = await getPriceFull()
    return {
      cursor: tokens.pageKey,
      tokens: tokens.tokens
        .filter((x) => x.rawBalance !== undefined && 0 != +x.rawBalance)
        .map((x) => ({
          address,
          name: x.name || "",
          symbol: x.symbol || "",
          logo: x.logo,
          balance: x.balance ?? "0.00",
          contractAddress: x.contractAddress,
          balanceinUsd: this.priceInUsd(price, x.balance, x.symbol),
        })),
    }
  }

  public async getAccounts(
    identity: DelegationIdentity,
    defaultIcon?: string,
  ): Promise<Array<TokenBalanceSheet>> {
    const tokens = await this.getErc20TokensByUser({ identity })
    return tokens.tokens.map((l) => {
      return super.computeSheetForRootAccount(
        l,
        identity.getPrincipal().toText(),
        defaultIcon,
      )
    })
  }

  public async getNativeAccount(
    identity: DelegationIdentity,
    defaultIcon?: string,
  ): Promise<TokenBalanceSheet> {
    const address = await this.getAddress(identity)
    const balance = await this.getBalance(undefined, identity)
    const token: Token = {
      address: address,
      balance: balance.balance ?? "0.00",
      balanceinUsd: "$" + (balance.balanceinUsd ?? "0.00"),
      logo: defaultIcon,
      name: this.getNativeToken(),
      symbol: this.getNativeCurrency(),
    }
    return super.computeSheetForRootAccount(
      token,
      identity.getPrincipal().toText(),
      defaultIcon,
    )
  }

  public async getTransactionHistory(
    identity: DelegationIdentity,
    contract?: string,
  ): Promise<FungibleTxs> {
    const address = await this.getAddress(identity)
    const receivedTransactions = await this.getFungibleActivityByTokenAndUser({
      direction: "to",
      contract,
      address,
    }).then((receiveTsx) => {
      return receiveTsx.activities.map((tx) =>
        this.toTransactionRow(tx, address),
      )
    })
    const sendTransactions = await this.getFungibleActivityByTokenAndUser({
      direction: "from",
      contract,
      address,
    }).then((sendTsx) => {
      return sendTsx.activities.map((tx) => this.toTransactionRow(tx, address))
    })
    const addressPrincipal = principalToAddress(identity.getPrincipal())
    return {
      sendTransactions,
      receivedTransactions,
      walletAddress: addressPrincipal,
      btcAddress: address,
    }
  }

  public async getFungibleActivityByTokenAndUser(
    {
      direction = "from",
      contract,
      cursor,
      size,
      sort = "desc",
      address,
    }: FungibleActivityRequest,
    delegation?: DelegationIdentity,
  ): Promise<FungibleActivityRecords> {
    const addressVal = await this.getAddressByIdentity(
      address ?? delegation ?? undefined,
    )
    const alchemySdk = this.getAlchemySdk(
      this.config.alchemyNetwork,
      this.config.alchemyApiKey,
    )

    const transfers = await alchemySdk.core.getAssetTransfers({
      fromAddress: "from" == direction ? addressVal : undefined,
      toAddress: "to" == direction ? addressVal : undefined,
      category: contract
        ? [AssetTransfersCategory.ERC20]
        : [AssetTransfersCategory.EXTERNAL],
      withMetadata: true,
      order: "asc" == sort ? SortingOrder.ASCENDING : SortingOrder.DESCENDING,
      maxCount: size,
      pageKey: cursor,
    })
    return {
      cursor: transfers.pageKey,
      activities: transfers.transfers.map((x) => ({
        id: x.uniqueId,
        date: x.metadata.blockTimestamp,
        to: x.to || "",
        from: x.from,
        transactionHash: x.hash,
        price: x.value || 0,
        asset: x.asset || x.erc721TokenId || "",
      })),
    }
  }

  private getAddressByIdentity(identity?: Identity): Promise<string> {
    if (!identity) {
      throw Error("No Identity provided.")
    }
    return identity instanceof DelegationIdentity
      ? this.getAddressByDelegation(identity as DelegationIdentity)
      : Promise.resolve(identity as Address)
  }

  private getAddressByDelegation(
    delegation: DelegationIdentity,
  ): Promise<string> {
    const wallet = this.getWallet(delegation, this.config.providerUrl)
    return wallet.getAddress()
  }

  private mapActivity(activity: RaribleActivity): ActivityRecord {
    switch (activity["@type"]) {
      case "SELL": {
        const sell = activity as OrderMatchSell
        return {
          id: sell.id.toString(),
          type: sell["@type"].toString(),
          date: sell.date,
          to: removeChain(sell.buyer),
          from: removeChain(sell.seller),
          transactionHash: activity.transactionHash,
          price: sell.price.toString(),
          priceUsd: sell.priceUsd?.toString(),
        }
      }
      case "TRANSFER": {
        const transfer = activity as TransferActivity
        return {
          id: transfer.id.toString(),
          type: transfer["@type"].toString(),
          date: transfer.date,
          from: removeChain(transfer.from),
          to: removeChain(transfer.owner),
          transactionHash: activity.transactionHash,
        }
      }
      default: {
        throw Error("Not supported Activity Type.")
      }
    }
  }

  private getWallet(
    delegation: DelegationIdentity,
    providerUrl: string,
  ): EthWalletV2 {
    const rpcProvider = new ethers.providers.JsonRpcProvider(providerUrl)
    return new EthWalletV2(rpcProvider, delegation)
  }

  private getRaribleSdk(
    raribleEnv: RaribleSdkEnvironment,
    raribleKey: string,
    wallet?: EthWallet,
  ): IRaribleSdk {
    const ethersWallet = wallet
      ? new EthereumWallet(new EthersEthereum(wallet))
      : undefined
    const raribleSdk = createRaribleSdk(ethersWallet, raribleEnv, {
      apiKey: raribleKey,
    })
    return raribleSdk
  }

  private getAlchemySdk(
    alchemyNetwork: Network,
    alchemyApiKey: string,
  ): Alchemy {
    return new Alchemy({
      apiKey: alchemyApiKey,
      network: alchemyNetwork,
    })
  }

  private priceInUsd(price: any, balance?: string, token?: string) {
    if (!token || !balance) {
      return ""
    }
    const selectedTokenPrice = price[token]
    if (!selectedTokenPrice) {
      return ""
    }
    const balanceBN = toBn(balance)
    const usd = toBn(selectedTokenPrice).multipliedBy(balanceBN)
    return "$" + (usd?.toFixed(2).toString() ?? "0.00")
  }
}
