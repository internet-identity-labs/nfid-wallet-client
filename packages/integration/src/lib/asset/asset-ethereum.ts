import { DelegationIdentity } from "@dfinity/identity"
import {
  TransactionResponse,
  TransactionRequest,
} from "@ethersproject/abstract-provider"
import {
  Activity as RaribleActivity,
  ActivitySort,
  ActivityType,
  OrderMatchSell,
  TransferActivity,
  UserActivityType,
} from "@rarible/api-client"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk, IRaribleSdk } from "@rarible/sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import {
  convertEthereumItemId,
  convertEthereumToUnionAddress,
} from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toCurrencyId, UnionAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  OwnedNftsResponse as AlchemyOwnedNftsResponse,
  BigNumber,
  SortingOrder,
} from "alchemy-sdk"
import { ethers } from "ethers-ts"
import {
  AccountBalance,
  AppBalance,
  TokenBalanceSheet,
} from "./types"

import { EthWallet } from "../ecdsa-signer/ecdsa-wallet"
import { EthWalletV2 } from "../ecdsa-signer/signer-ecdsa"
import { getPrice } from "./asset"
import { getPriceFull } from "./asset"
import {
  ActivitiesByItemRequest,
  ActivitiesByUserRequest,
  ActivityRecord,
  Address,
  ChainBalance,
  Configuration,
  Erc20TokensByUserRequest,
  FungibleActivityRecords,
  FungibleActivityRequest,
  Identity,
  ItemsByUserRequest,
  NonFungibleActivityRecords,
  NonFungibleAsset,
  NonFungibleItems,
  Token,
  Tokens,
  TransferETHRequest,
  Erc20TokensByUserRequest,
  EstimatedTransaction,
  EstimatedTransactionRequest,
  EtherscanTransactionHashUrl,
  TransferNftRequest,
} from "./types"
import { E8S } from "@nfid/integration/token/icp";

export class EthereumAsset implements NonFungibleAsset {
  private readonly config: Configuration

  constructor(config: Configuration) {
    this.config = config
  }

  async transfer(
    identity: DelegationIdentity,
    transaction: ethers.providers.TransactionRequest,
  ): Promise<EtherscanTransactionHashUrl> {
    const wallet = this.getWallet(identity, CHAIN_NETWORK, this.config)
    const etherscanUrl = this.getEtherscanUrl(CHAIN_NETWORK, this.config)
    const response = await wallet.sendTransaction(transaction)
    return `${etherscanUrl}${response.hash}`
  }

  async getEstimatedTransaction({
    identity,
    to,
    amount,
    tokenId,
  }: EstimatedTransactionRequest): Promise<EstimatedTransaction> {
    const wallet = this.getWallet(identity, CHAIN_NETWORK, this.config)
    const [from, nonce, feeData, rates] = await Promise.all([
      wallet.getAddress(),
      wallet.getTransactionCount("latest"),
      wallet.getFeeData(),
      getPrice(["ETH"]),
    ])

    if (
      !feeData.gasPrice ||
      !feeData.maxPriorityFeePerGas ||
      !feeData.maxFeePerGas
    ) {
      throw Error("No FeeData received from Provider.")
    }

    const { gasPrice, maxPriorityFeePerGas, maxFeePerGas } = feeData

    const transaction: TransactionRequest = {
      from,
      to,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas,
    }

    if (amount) {
      transaction.value = ethers.utils.parseEther(amount)
    }

    transaction.gasLimit = await wallet.estimateGas(transaction)

    const ethPrice = parseFloat(rates[0].price)
    const fee = transaction.gasLimit.mul(gasPrice)
    const feeUsd = parseFloat(ethers.utils.formatEther(fee)) * ethPrice
    const maxFee = transaction.gasLimit.mul(maxFeePerGas)
    const maxFeeUsd = parseFloat(ethers.utils.formatEther(maxFee)) * ethPrice

    return {
      transaction,
      fee: ethers.utils.formatEther(fee),
      feeUsd: feeUsd.toFixed(2),
      maxFee: ethers.utils.formatEther(maxFee),
      maxFeeUsd: maxFeeUsd.toFixed(2),
    }
  }

  public async getAddress(delegation?: DelegationIdentity): Promise<string> {
    if (!delegation) {
      throw Error("Delegation is needed.")
    }
    const wallet = this.getWallet(delegation, CHAIN_NETWORK, this.config)
    return await wallet.getAddress()
  }

  public async getActivitiesByItem({
    tokenId,
    contract,
    cursor,
    sort,
    size,
  }: ActivitiesByItemRequest): Promise<NonFungibleActivityRecords> {
    const raribleSdk = this.getRaribleSdk(CHAIN_NETWORK)
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
    const raribleSdk = this.getRaribleSdk(CHAIN_NETWORK)
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
    const alchemySdk = this.getAlchemySdk(CHAIN_NETWORK, this.config)
    const tokens: AlchemyOwnedNftsResponse =
      await alchemySdk.nft.getNftsForOwner(address, {
        pageKey: cursor,
        pageSize: size,
        omitMetadata: false,
      })

    return {
      total: tokens.totalCount,
      items: tokens.ownedNfts.map((item) => {
        const contract = item.contract.address
        const chain = this.config.blockchain.toString()
        return {
          id: `${chain}:${contract}:${item.tokenId}`,
          blockchain: chain,
          collection: contract,
          contract: contract,
          tokenId: item.tokenId,
          lastUpdatedAt: item.timeLastUpdated,
          thumbnail: item.media.length ? item.media[0]?.thumbnail : "",
          image: item.media.length ? item.media[0]?.gateway : "",
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
    const raribleSdk = this.getRaribleSdk(CHAIN_NETWORK)
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
    const balanceBN = toBn(balance)
    const balanceinUsd = toBn(currencyRate.rate).multipliedBy(balanceBN)
    return { balance: balanceBN, balanceinUsd }
  }

  public async transferNft({
    delegation,
    tokenId,
    contract,
    receiver,
  }: TransferNftRequest): Promise<void> {
    const wallet = this.getWallet(delegation, CHAIN_NETWORK, this.config)
    return await wallet.safeTransferFrom(receiver, contract, tokenId)
  }

  public async transferETH({
    delegation,
    to,
    amount,
  }: TransferETHRequest): Promise<TransactionResponse> {
    const wallet = this.getWallet(delegation, CHAIN_NETWORK, this.config)
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
    const alchemySdk = this.getAlchemySdk(CHAIN_NETWORK, this.config)
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
          name: x.name || "N/A",
          symbol: x.symbol || "N/A",
          logo: x.logo,
          balance: x.balance || "0",
          contractAddress: x.contractAddress,
          balanceinUsd: this.priceInUsd(price, x.balance, x.symbol),
        })),
    }
  }

  public async getErc20Accounts(identity: DelegationIdentity): Promise<Array<TokenBalanceSheet>> {
    return this.getErc20TokensByUser({ identity }).then((tokens) =>
      tokens.tokens.map((l) => {
        return this.computeSheetForRootAccount(
          l,
          identity.getPrincipal().toText(),
        )
      }),
    )
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
    const alchemySdk = this.getAlchemySdk(CHAIN_NETWORK, this.config)

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
        to: x.to || "N/A",
        from: x.from,
        transactionHash: x.hash,
        price: x.value || 0,
      })),
    }
  }

  private getEtherscanUrl(mode: string, config: Configuration) {
    const url =
      "mainnet" == mode
        ? config.etherscanUrl.mainnet
        : config.etherscanUrl.testnet
    return url
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
    const wallet = this.getWallet(delegation, CHAIN_NETWORK, this.config)
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
          to: sell.buyer.toString(),
          from: sell.seller.toString(),
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
          from: transfer.from.toString(),
          to: transfer.owner.toString(),
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
    mode: string,
    config: Configuration,
  ): EthWalletV2 {
    const url =
      "mainnet" == mode ? config.provider.mainnet : config.provider.testnet
    const rpcProvider = new ethers.providers.JsonRpcProvider(url)
    return new EthWalletV2(rpcProvider, delegation)
  }

  private getRaribleSdk(mode: string, wallet?: EthWallet): IRaribleSdk {
    const network = "mainnet" == mode ? "prod" : "testnet"
    const ethersWallet = wallet
      ? new EthereumWallet(new EthersEthereum(wallet))
      : undefined
    const raribleSdk = createRaribleSdk(ethersWallet, network)
    return raribleSdk
  }

  private getAlchemySdk(mode: string, config: Configuration): Alchemy {
    const alchemyNetwork: Network =
      "mainnet" == mode ? config.alchemy.mainnet : config.alchemy.testnet
    return new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: alchemyNetwork,
    })
  }

  private computeSheetForRootAccount(
    token: Token,
    principalId: string,
  ): TokenBalanceSheet {
    const rootAccountBalance: AccountBalance = {
      accountName: "account 1",
      address: token.address,
      principalId,
      tokenBalance: BigInt(this.stringICPtoE8s(token.balance)),
      usdBalance: token.balanceinUsd,
    }
    const appBalance: AppBalance = {
      accounts: [rootAccountBalance],
      appName: "NFID",
      tokenBalance: BigInt(this.stringICPtoE8s(token.balance)),
    }
    return {
      applications: {
        NFID: appBalance,
      },
      icon: token.logo ? token.logo : "",
      label: token.name,
      token: token.symbol,
      tokenBalance: BigInt(this.stringICPtoE8s(token.balance)),
      usdBalance: token.balanceinUsd,
    }
  }

  private stringICPtoE8s = (value: string) => {
    return Number(parseFloat(value) * E8S)
  }

  private priceInUsd(price: any, balance?: string, token?: string) {
    if (!token || !balance) {
      return "N/A"
    }
    const selectedTokenPrice = price[token]
    if (!selectedTokenPrice) {
      return "N/A"
    }
    const balanceBN = toBn(balance)
    const usd = toBn(selectedTokenPrice).multipliedBy(balanceBN)
    return "$" + (usd?.toFixed(2) ?? "0.00")
  }
}
