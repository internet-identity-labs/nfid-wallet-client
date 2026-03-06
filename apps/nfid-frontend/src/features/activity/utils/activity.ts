import { IActivityRow } from "../types"
import { getBtcActivitiesRows } from "frontend/integration/bitcoin/services/btc-transaction-service"
import { ethTransactionService } from "frontend/integration/ethereum/eth/eth-transaction.service"
import { getIcrc1ActivitiesRows } from "./icrc1-activity"
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
import {
  BtcNoteKey,
  EvmNoteKey,
  IcpNoteKey,
  NoteKeyable,
} from "frontend/integration/note/note-key"
import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"
import { ChainId, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}

export const getAllActivity = async (
  limit: number,
  activeTokens: FT[],
): Promise<IActivityRow[]> => {
  const btcAddress = await fetchBtcAddress()
  const evmAddress = await fetchEthAddress()

  const [icrc1Activities, swapActivities, btcActivities, evmActivities] =
    await Promise.all([
      getIcrc1ActivitiesRows(limit, activeTokens),
      getSwapActivitiesRows(activeTokens),
      getBtcActivitiesRows(btcAddress),
      fetchEvmActivitiesSequentially(evmAddress),
    ])

  const [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
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
  ]

  await populateNotes(activitiesArray)

  return activitiesArray
}

const toHex = (arr: Uint8Array | number[]): string =>
  (arr instanceof Uint8Array ? arr : new Uint8Array(arr)).reduce(
    (s, b) => s + b.toString(16).padStart(2, "0"),
    "",
  )

const buildNoteKey = (row: IActivityRow): NoteKeyable | null => {
  if (row.asset.type !== "ft") return null
  const { chainId, canister } = row.asset as ActivityAssetFT
  if (chainId === ChainId.ICP) return new IcpNoteKey(BigInt(row.id), canister)
  if (isEvmToken(chainId)) return new EvmNoteKey(row.id, chainId)
  if (chainId === ChainId.BTC) return new BtcNoteKey(row.id)
  return null
}

const populateNotes = async (rows: IActivityRow[]): Promise<void> => {
  const rowKeyPairs = rows.flatMap((row) => {
    const key = buildNoteKey(row)
    return key ? [{ row, key }] : []
  })

  if (rowKeyPairs.length === 0) return

  const blobs = await Promise.all(rowKeyPairs.map(({ key }) => key.toBlob()))

  const blobHexToRow = new Map<string, IActivityRow>(
    blobs.map((blob, i) => [toHex(blob), rowKeyPairs[i].row]),
  )

  const noteEntries = await noteService.getNotesByBlobs(blobs)

  for (const entry of noteEntries) {
    const row = blobHexToRow.get(toHex(entry.key))
    if (row) row.note = entry.value
  }
}

const fetchEvmActivitiesSequentially = async (
  evmAddress: string,
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

  return [
    ethActivities,
    ethErc20Activities,
    arbitrumErc20Activities,
    polygonErc20Activities,
    arbitrumActivities,
    polygonActivities,
  ]
}
