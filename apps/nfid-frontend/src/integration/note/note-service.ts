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

import { NOTE_MAX_LENGTH, NoteKeyable } from "./note-key"

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
   * Returns note entries for pre-computed blob keys.
   * Use this when blobs are already computed to avoid re-hashing.
   */
  async getNotesByBlobs(blobs: Uint8Array[]): Promise<Array<NoteEntry>> {
    return this.storageActor.get_notes(blobs)
  }
}

export const noteService = new NoteService()
