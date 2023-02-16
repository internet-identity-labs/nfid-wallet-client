import {
  Activity as RaribleActivity,
  TransferActivity,
  ActivitySort,
  ActivityType,
  OrderMatchSell,
  Item as RaribleItem,
  UserActivityType,
} from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk, IRaribleSdk } from "@rarible/sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import {
  convertEthereumToUnionAddress,
  convertEthereumItemId,
  EVMBlockchain,
} from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toCurrencyId, UnionAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import {
  Network,
  Alchemy,
  SortingOrder,
  AssetTransfersCategory,
} from "alchemy-sdk"
import { ethers } from "ethers-ts"

import { EthWallet } from "../ecdsa-signer/ecdsa-wallet"
import {
  Asset,
  Balance,
  ActivityRecord,
  NonFungibleActivityRecords,
  NonFungibleItem,
  NonFungibleItems,
  FungibleActivityRecords,
  Tokens,
  FungibleActivityRequest,
} from "./types.d"

declare const FRONTEND_MODE: string
declare const ALCHEMY_API_KEY: string

const currencyId = "ETHEREUM:0x0000000000000000000000000000000000000000"
const mainnet = "https://ethereum.publicnode.com"
const testnet = "https://ethereum-goerli-rpc.allthatnode.com"
const blockchain = Blockchain.ETHEREUM as EVMBlockchain
const [sdk, wallet] = getRaribleSdk(FRONTEND_MODE)
const alchemyNetwork =
  "production" == FRONTEND_MODE ? Network.ETH_MAINNET : Network.ETH_GOERLI

export const EthereumAsset: Asset = {
  getActivitiesByItem: async function (
    tokenId: string,
    contract: string,
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords> {
    const itemId = convertEthereumItemId(`${contract}:${tokenId}`, blockchain)
    const raribleActivities = await sdk.apis.activity.getActivitiesByItem({
      type: [ActivityType.SELL, ActivityType.TRANSFER],
      itemId,
      cursor,
      size,
      sort: ActivitySort.LATEST_FIRST,
    })

    return {
      activities: raribleActivities.activities.map(mapActivity),
      cursor: raribleActivities.cursor,
    }
  },

  getActivitiesByUser: async function (
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords> {
    const address = await wallet.getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      blockchain,
    )
    const raribleActivities = await sdk.apis.activity.getActivitiesByUser({
      type: [
        UserActivityType.SELL,
        UserActivityType.TRANSFER_FROM,
        UserActivityType.TRANSFER_TO,
        UserActivityType.BUY,
      ],
      user: [unionAddress],
      cursor,
      size,
      blockchains: [blockchain],
      sort: ActivitySort.LATEST_FIRST,
    })
    return {
      activities: raribleActivities.activities.map(mapActivity),
      cursor: raribleActivities.cursor,
    }
  },

  getItemsByUser: async function (
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleItems> {
    const address = await wallet.getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      blockchain,
    )
    const raribleItems = await sdk.apis.item.getItemsByOwner({
      owner: unionAddress,
      size,
      continuation: cursor,
      blockchains: [blockchain],
    })
    return {
      total: raribleItems.total,
      items: raribleItems.items.map(mapItem),
    }
  },

  getBalance: async function (): Promise<Balance> {
    const address = await wallet.getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      blockchain,
    )
    const now = new Date()
    const [balance, currencyRate] = await Promise.all([
      sdk.balances.getBalance(unionAddress, toCurrencyId(currencyId)),
      sdk.apis.currency.getCurrencyUsdRateByCurrencyId({
        currencyId: currencyId,
        at: now,
      }),
    ])
    const balanceBN = toBn(balance)
    const balanceinUsd = toBn(currencyRate.rate).multipliedBy(balanceBN)
    return { balance: balanceBN, balanceinUsd }
  },

  transferNft: async function (
    tokenId: string,
    contract: string,
    receiver: string,
  ): Promise<void> {
    wallet.safeTransferFrom(receiver, contract, tokenId)
  },

  getErc20TokensByUser: async function (cursor?: string): Promise<Tokens> {
    const alchemy = new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: alchemyNetwork,
    })
    const address = await wallet.getAddress()
    const tokens = await alchemy.core.getTokensForOwner(address, {
      pageKey: cursor,
    })
    return {
      cursor: tokens.pageKey,
      tokens: tokens.tokens
        .filter((x) => x.rawBalance !== undefined && 0 != +x.rawBalance)
        .map((x) => ({
          name: x.name || "N/A",
          symbol: x.symbol || "N/A",
          logo: x.logo,
          balance: x.balance || "0.0",
          contractAddress: x.contractAddress,
        })),
    }
  },

  getFungibleActivityByTokenAndUser: async function ({
    direction = "from",
    contract,
    cursor,
    size,
    sort = "desc",
  }: FungibleActivityRequest = {}): Promise<FungibleActivityRecords> {
    const alchemy = new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: alchemyNetwork,
    })
    const address = await wallet.getAddress()
    const transfers = await alchemy.core.getAssetTransfers({
      fromAddress: "from" == direction ? address : undefined,
      toAddress: "to" == direction ? address : undefined,
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
  },
}

const mapActivity = (activity: RaribleActivity): ActivityRecord => {
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

const mapItem = (raribleItem: RaribleItem): NonFungibleItem => {
  return {
    id: raribleItem.id.toString(),
    blockchain: raribleItem.blockchain.toString(),
    collection: raribleItem.collection?.toString(),
    contract: raribleItem.contract?.toString(),
    tokenId: raribleItem.tokenId?.toString(),
    lastUpdatedAt: raribleItem.lastUpdatedAt.toString(),
  }
}

function getRaribleSdk(mode: string): [IRaribleSdk, EthWallet] {
  const network = "production" == FRONTEND_MODE ? "prod" : "testnet"
  const url = "production" == mode ? mainnet : testnet
  const rpcProvider = new ethers.providers.JsonRpcProvider(url)
  const wallet = new EthWallet(rpcProvider)
  const ethersWallet = new EthereumWallet(new EthersEthereum(wallet))
  const sdk = createRaribleSdk(ethersWallet, network)

  return [sdk, wallet]
}
export { Balance }
