import {
  StorageMode,
  idbService,
  rememberMeLocalStorage,
  storageModeState,
} from "@nfid/client-db"

import { KEY_ANCHOR } from "../authentication/storage"

import { RAW_KEYS_TO_MOVE } from "./constants"
import { RememberMeError } from "./error/remember-me.error"

export * from "./error/remember-me.error"

export interface RememberMeService {
  isRemembered(): boolean
  doNotRememberMe(): Promise<void>
}

export const rememberMeService: RememberMeService = {
  isRemembered(): boolean {
    try {
      return !!window.localStorage.getItem(KEY_ANCHOR)
    } catch {
      return false
    }
  },

  async doNotRememberMe(): Promise<void> {
    if (storageModeState.get() === StorageMode.MEMORY) return

    try {
      await idbService.migrateAllToMemory()
    } catch (error) {
      console.error("migration failed", error)
      throw new RememberMeError("Unable to switch to in-memory storage")
    }

    try {
      await idbService.deleteAll()
    } catch (error) {
      idbService.rebindAllToDisk()
      console.error("on-disk wipe failed, rolled back to DISK", error)
      throw new RememberMeError("Unable to clear on-disk storage")
    }

    rememberMeLocalStorage.moveToMemory(RAW_KEYS_TO_MOVE)
    storageModeState.set(StorageMode.MEMORY)
  },
}
