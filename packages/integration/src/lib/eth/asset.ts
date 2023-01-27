import {
  Activities,
  ActivitySort,
  ActivityType,
  Items,
  UserActivityType,
} from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import { convertEthereumToUnionAddress, EVMBlockchain } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toCurrencyId, UnionAddress } from "@rarible/types"
import { toBn, BigNumber } from "@rarible/utils"

import { RaribleBridge } from "../rarible"

declare const FRONTEND_MODE: string

const config = {
  blockchain: Blockchain.ETHEREUM as EVMBlockchain,
  mainnet: "https://ethereum.publicnode.com",
  testnet: "https://ethereum-goerli-rpc.allthatnode.com",
  currency: "ETHEREUM:0x0000000000000000000000000000000000000000"
}

const net = "production" == FRONTEND_MODE ? config.mainnet : config.testnet

export type Balance = {
  balance: BigNumber
  balanceinUsd: BigNumber
}

export type Asset = {
  getActivitiesByItem(
    itemId: string,
    cursor?: string,
    size?: number,
  ): Promise<Activities>
  getActivitiesByUser(cursor?: string, size?: number): Promise<Activities>
  getItemsByUser(cursor?: string, size?: number): Promise<Items>
  getBalance(): Promise<Balance>
  transfer(tokenId: string, constract: string, receiver: string): Promise<void>
}

export const EthereumAsset: Asset = {
  getActivitiesByItem: async function (
    itemId: string,
    cursor?: string,
    size?: number,
  ): Promise<Activities> {
    const rarible = new RaribleBridge(net)
    const activities = await rarible.sdk().apis.activity.getActivitiesByItem({
      type: [ActivityType.SELL, ActivityType.TRANSFER],
      itemId,
      cursor,
      size,
      sort: ActivitySort.LATEST_FIRST,
    })
    return activities
  },

  getActivitiesByUser: async function (
    cursor?: string,
    size?: number,
  ): Promise<Activities> {
    const rarible = new RaribleBridge(net)
    const address = await rarible.ethersWallet().getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      config.blockchain,
    )
    const activities = await rarible.sdk().apis.activity.getActivitiesByUser({
      type: [
        UserActivityType.SELL,
        UserActivityType.TRANSFER_FROM,
        UserActivityType.TRANSFER_TO,
        UserActivityType.BUY,
      ],
      user: [unionAddress],
      cursor,
      size,
      blockchains: [config.blockchain],
      sort: ActivitySort.LATEST_FIRST,
    })
    return activities
  },

  getItemsByUser: async function (
    cursor?: string,
    size?: number,
  ): Promise<Items> {
    const rarible = new RaribleBridge(net)
    const address = await rarible.ethersWallet().getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      config.blockchain,
    )
    const items = await rarible.sdk().apis.item.getItemsByOwner({
      owner: unionAddress,
      size,
      continuation: cursor,
      blockchains: [config.blockchain],
    })
    return items
  },

  getBalance: async function (): Promise<Balance> {
    const rarible = new RaribleBridge(net)
    const address = await rarible.ethersWallet().getAddress()
    const unionAddress: UnionAddress = convertEthereumToUnionAddress(
      address,
      config.blockchain,
    )
    const [balance, currencyRate] = await Promise.all([
      rarible.sdk().balances.getBalance(unionAddress, toCurrencyId(config.currency)),
      rarible.sdk().apis.currency.getCurrencyUsdRateByCurrencyId({
        currencyId: config.currency,
        at: new Date(),
      }),
    ])
    const balanceBN = toBn(balance)
    const balanceinUsd = toBn(currencyRate.rate).multipliedBy(balanceBN)
    return { balance: balanceBN, balanceinUsd }
  },

  transfer: async function (
    tokenId: string,
    contract: string,
    receiver: string,
  ): Promise<void> {
    const rarible = new RaribleBridge(net)
    rarible.ethersWallet().safeTransferFrom(receiver, contract, tokenId)
  },
}
