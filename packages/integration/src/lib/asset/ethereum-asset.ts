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
  EVMBlockchain,
} from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toCurrencyId, UnionAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import { ethers } from "ethers-ts"

import { EthWallet } from "../ecdsa-signer/ecdsa-wallet"
import { Asset, Balance, NonFungibleActivityRecord, NonFungibleActivityRecords, NonFungibleItem, NonFunmgibleItems } from "./asset"

declare const FRONTEND_MODE: string

const currencyId = "ETHEREUM:0x0000000000000000000000000000000000000000"
const mainnet = "https://ethereum.publicnode.com"
const testnet = "https://ethereum-goerli-rpc.allthatnode.com"
const blockchain = Blockchain.ETHEREUM as EVMBlockchain
const [sdk, wallet] = getRaribleSdk(FRONTEND_MODE)

export const EthereumAsset: Asset = {
  getActivitiesByItem: async function (
    itemId: string,
    cursor?: string,
    size?: number,
  ): Promise<NonFungibleActivityRecords> {
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
  ): Promise<NonFunmgibleItems> {
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
}

const mapActivity = (activity: RaribleActivity): NonFungibleActivityRecord => {
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

