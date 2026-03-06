import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { idlFactory as SwapStorageIDL } from "@nfid/integration/_ic_api/swap_trs_storage"
import {
  NoteEntry,
  _SERVICE as SwapStorage,
} from "@nfid/integration/_ic_api/swap_trs_storage.d"

import {
  actor,
  agentBaseConfig,
  authState,
  replaceActorIdentity,
} from "@nfid/integration"
import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"
import { ChainId, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"

import { Storage } from "@nfid/client-db"

import { IActivityRow } from "frontend/features/activity/types"
import {
  BtcNoteKey,
  EvmNoteKey,
  IcpNoteKey,
  NOTE_MAX_LENGTH,
  NoteKeyable,
} from "./note-key"

const NOTES_CACHE_KEY = "notes_cache"
const notesStorage = new Storage<Record<string, NoteEntry>>({
  dbName: "notes-db",
  storeName: "notes-store",
})

const toHex = (b: Uint8Array | number[]): string =>
  Array.from(b, (byte) => byte.toString(16).padStart(2, "0")).join("")

const buildNoteKey = (row: IActivityRow): NoteKeyable | null => {
  if (row.asset.type !== "ft") return null
  const { chainId, canister } = row.asset as ActivityAssetFT
  if (chainId === ChainId.ICP) return new IcpNoteKey(BigInt(row.id), canister)
  if (isEvmToken(chainId)) return new EvmNoteKey(row.id, chainId)
  if (chainId === ChainId.BTC) return new BtcNoteKey(row.id)
  return null
}

export class NoteService {
  private storageActor: Agent.ActorSubclass<SwapStorage>

  constructor() {
    this.storageActor = actor<SwapStorage>(SWAP_TRS_STORAGE, SwapStorageIDL, {
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
  }

  /**
   * Stores a note for a given key derived from network-specific params.
   * Note is limited to NOTE_MAX_LENGTH characters on the backend.
   */
  async storeNote<T extends NoteKeyable>(
    params: T,
    note: string,
  ): Promise<void> {
    if (note.length > NOTE_MAX_LENGTH) {
      throw new Error(
        `Note exceeds the maximum allowed length of ${NOTE_MAX_LENGTH} characters`,
      )
    }

    const di = authState.get().delegationIdentity
    if (!di) {
      throw new Error("Delegation identity not set")
    }

    await replaceActorIdentity(this.storageActor, di)

    const key = await params.toBlob()
    await this.storageActor.store_note(key, note)
  }

  /**
   * Returns note entries for the given list of key params.
   * Each param's toBlob() is called to derive the lookup key.
   */
  async getNotes<T extends NoteKeyable>(
    params: T[],
  ): Promise<Array<NoteEntry>> {
    const keys = await Promise.all(params.map((p) => p.toBlob()))
    return this.storageActor.get_notes(keys)
  }

  /**
   * Populates row.note for each activity row that has a note on-chain.
   * Uses a permanent accumulative cache (no TTL — notes are immutable once stored):
   * only blobs absent from the cache are fetched from the network.
   */
  async populateNotes(rows: IActivityRow[]): Promise<void> {
    const rowKeyPairs = rows.flatMap((row) => {
      const key = buildNoteKey(row)
      return key ? [{ row, key }] : []
    })

    if (rowKeyPairs.length === 0) return

    const blobs = await Promise.all(rowKeyPairs.map(({ key }) => key.toBlob()))

    const cached: Record<string, NoteEntry> =
      (await notesStorage.get(NOTES_CACHE_KEY)) ?? {}

    const missingBlobs = blobs.filter((b) => !(toHex(b) in cached))

    if (missingBlobs.length > 0) {
      const fetched = await this.storageActor.get_notes(missingBlobs)
      fetched.forEach((entry) => {
        cached[toHex(entry.key as Uint8Array)] = entry
      })
      await notesStorage.set(NOTES_CACHE_KEY, cached)
    }

    const blobHexToRow = new Map<string, IActivityRow>(
      blobs.map((blob, i) => [toHex(blob), rowKeyPairs[i].row]),
    )

    for (const [hex, row] of blobHexToRow) {
      if (cached[hex]) row.note = cached[hex].value
    }
  }
}

export const noteService = new NoteService()
