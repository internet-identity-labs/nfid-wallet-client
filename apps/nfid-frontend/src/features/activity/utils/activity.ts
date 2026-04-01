import { IActivityRow } from "../types"
import { getBtcActivitiesRows } from "frontend/integration/bitcoin/services/btc-transaction-service"
import { ethTransactionService } from "frontend/integration/ethereum/eth/eth-transaction.service"
import {
  getIcrc1ActivitiesRows,
  getIcpViewOnlyActivitiesRows,
} from "./icrc1-activity"
import { getSwapActivitiesRows } from "./swap-activity"
import { fetchBtcAddress } from "frontend/util/fetch-btc-address"
import { fetchEthAddress } from "frontend/util/fetch-eth-address"
import { polygonTransactionService } from "frontend/integration/ethereum/polygon/pol-transaction.service"
import { arbitrumTransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-transaction.service"
import { ethErc20TransactionService } from "frontend/integration/ethereum/eth/eth-erc20-transaction.service"
import { arbitrumErc20TransactionService } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20-transaction.service"
import { polygonErc20TransactionService } from "frontend/integration/ethereum/polygon/pol-erc20-transaction.service"
import { delay } from "frontend/features/fungible-token/utils"
import { FT } from "frontend/integration/ft/ft"
import { noteService } from "frontend/integration/note/note-service"
import { polygonAmoyTransactionService } from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy-transaction.service"
import { polygonAmoyErc20TransactionService } from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy-erc20-transaction.service"
import { arbSepoliaTransactionService } from "frontend/integration/ethereum/arbitrum/testnetwork/arb-sepolia-transaction.service"
import { arbSepoliaErc20TransactionService } from "frontend/integration/ethereum/arbitrum/testnetwork/arb-sepolia-erc20-transaction.service"
import { ethSepoliaTransactionService } from "frontend/integration/ethereum/eth/testnetwork/eth-sepolia-transaction.service"
import { ethSepoliaErc20TransactionService } from "frontend/integration/ethereum/eth/testnetwork/eth-sepolia-erc20-transaction.service"

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}

export const getAllActivity = async (
  limit: number,
  activeTokens: FT[],
  testnetEnabled: boolean,
): Promise<IActivityRow[]> => {
  const btcAddress = await fetchBtcAddress()
  const evmAddress = await fetchEthAddress()

  const [icrc1Activities, swapActivities, btcActivities, evmActivities] =
    await Promise.all([
      getIcrc1ActivitiesRows(limit, activeTokens),
      getSwapActivitiesRows(activeTokens),
      getBtcActivitiesRows(btcAddress),
      fetchEvmActivitiesSequentially(evmAddress, testnetEnabled),
    ])

  const [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
    polygonAmoyActivities,
    polygonAmoyErc20Activities,
    arbitrumSepoliaActivities,
    arbitrumSepoliaErc20Activities,
    ethSepoliaActivities,
    ethSepoliaErc20Activities,
  ] = evmActivities

  const activitiesArray = [
    ...icrc1Activities,
    ...swapActivities,
    ...btcActivities,
    ...ethActivities,
    ...ethErc20Activities,
    ...arbitrumErc20Activities,
    ...polygonErc20Activities,
    ...arbitrumActivities,
    ...polygonActivities,
    ...polygonAmoyActivities,
    ...polygonAmoyErc20Activities,
    ...arbitrumSepoliaActivities,
    ...arbitrumSepoliaErc20Activities,
    ...ethSepoliaActivities,
    ...ethSepoliaErc20Activities,
  ]

  await noteService.populateNotes(activitiesArray)

  return activitiesArray
}

export const getAllViewOnlyActivity = async (
  limit: number,
  activeTokens: FT[],
  address: string,
  addressType: "icp" | "evm" | "btc",
): Promise<IActivityRow[]> => {
  if (addressType === "btc") {
    return getBtcActivitiesRows(address)
  }

  if (addressType === "evm") {
    const [
      ethActivities,
      ethErc20Activities,
      arbitrumErc20Activities,
      polygonErc20Activities,
      arbitrumActivities,
      polygonActivities,
    ] = await fetchEvmActivitiesSequentially(address)
    return [
      ...ethActivities,
      ...ethErc20Activities,
      ...arbitrumErc20Activities,
      ...polygonErc20Activities,
      ...arbitrumActivities,
      ...polygonActivities,
    ]
  }

  return getIcpViewOnlyActivitiesRows(address, limit, activeTokens)
}

const fetchEvmActivitiesSequentially = async (
  evmAddress: string,
  testnetEnabled?: boolean,
): Promise<
  [
    Awaited<ReturnType<typeof ethTransactionService.getActivitiesRows>>,
    Awaited<ReturnType<typeof ethErc20TransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof arbitrumErc20TransactionService.getActivitiesRows>
    >,
    Awaited<ReturnType<typeof arbitrumTransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof polygonErc20TransactionService.getActivitiesRows>
    >,
    Awaited<ReturnType<typeof polygonTransactionService.getActivitiesRows>>,
    Awaited<ReturnType<typeof polygonAmoyTransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof polygonAmoyErc20TransactionService.getActivitiesRows>
    >,

    Awaited<ReturnType<typeof arbSepoliaTransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof arbSepoliaErc20TransactionService.getActivitiesRows>
    >,

    Awaited<ReturnType<typeof ethSepoliaTransactionService.getActivitiesRows>>,
    Awaited<
      ReturnType<typeof ethSepoliaErc20TransactionService.getActivitiesRows>
    >,
  ]
> => {
  const ethActivities =
    await ethTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const ethErc20Activities =
    await ethErc20TransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const arbitrumErc20Activities =
    await arbitrumErc20TransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const arbitrumActivities =
    await arbitrumTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const polygonActivities =
    await polygonTransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  const polygonErc20Activities =
    await polygonErc20TransactionService.getActivitiesRows(evmAddress)
  await delay(350)

  let polygonAmoyActivities = [] as IActivityRow[]
  let polygonAmoyErc20Activities = [] as IActivityRow[]
  let arbitrumSepoliaActivities = [] as IActivityRow[]
  let arbitrumSepoliaErc20Activities = [] as IActivityRow[]
  let ethSepoliaActivities = [] as IActivityRow[]
  let ethSepoliaErc20Activities = [] as IActivityRow[]

  if (testnetEnabled) {
    polygonAmoyActivities =
      await polygonAmoyTransactionService.getActivitiesRows(evmAddress)
    await delay(350)

    polygonAmoyErc20Activities =
      await polygonAmoyErc20TransactionService.getActivitiesRows(evmAddress)
    await delay(350)

    arbitrumSepoliaActivities =
      await arbSepoliaTransactionService.getActivitiesRows(evmAddress)
    await delay(350)

    arbitrumSepoliaErc20Activities =
      await arbSepoliaErc20TransactionService.getActivitiesRows(evmAddress)
    await delay(350)

    ethSepoliaActivities =
      await ethSepoliaTransactionService.getActivitiesRows(evmAddress)
    await delay(350)

    ethSepoliaErc20Activities =
      await ethSepoliaErc20TransactionService.getActivitiesRows(evmAddress)
  }

  return [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
    polygonAmoyActivities,
    polygonAmoyErc20Activities,
    arbitrumSepoliaActivities,
    arbitrumSepoliaErc20Activities,
    ethSepoliaActivities,
    ethSepoliaErc20Activities,
  ]
}
