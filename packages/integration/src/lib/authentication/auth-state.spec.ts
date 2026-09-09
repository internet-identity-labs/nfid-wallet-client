/**
 * @jest-environment jsdom
 */
import {
  idbService,
  rememberMeLocalStorage,
  storageModeState,
} from "@nfid/client-db"
import { deleteDB, openDB } from "idb"

import { KEY_ANCHOR, KEY_BTC_ADDRESS, KEY_ETH_ADDRESS } from "./storage"

import "./auth-state"

jest.mock("idb", () => {
  const actual = jest.requireActual<typeof import("idb")>("idb")
  return {
    ...actual,
    deleteDB: jest.fn((...args: Parameters<typeof actual.deleteDB>) =>
      actual.deleteDB(...args),
    ),
  }
})

const deleteDbMock = deleteDB as jest.MockedFunction<typeof deleteDB>

type ResetAuthState = (hard: boolean) => Promise<boolean>

function getResetAuthState(): ResetAuthState {
  const withReset = window as unknown as { resetAuthState?: ResetAuthState }
  if (!withReset.resetAuthState) {
    throw new Error("window.resetAuthState was not installed by auth-state")
  }
  return withReset.resetAuthState
}

async function seedRegisteredDatabasesOnDisk(): Promise<string[]> {
  const names = idbService.getDbNames()
  for (const name of names) {
    const database = await openDB(name, 1, {
      upgrade(db) {
        db.createObjectStore("seed-store")
      },
    })
    database.close()
  }
  return names
}

beforeEach(() => {
  global.indexedDB = new IDBFactory()
  window.localStorage.clear()
  storageModeState.reset()
  idbService.clearMemory()
  rememberMeLocalStorage.clear()
  deleteDbMock.mockImplementation((...args: Parameters<typeof deleteDB>) =>
    jest.requireActual<typeof import("idb")>("idb").deleteDB(...args),
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe("_clearAuthSessionFromCache(hard) — logout IndexedDB wipe", () => {
  it("should delete every registered database on a hard clear", async () => {
    // Given every registered database exists on disk and the raw keys are set
    const registeredNames = await seedRegisteredDatabasesOnDisk()
    expect(registeredNames.length).toBeGreaterThan(0)
    window.localStorage.setItem(KEY_BTC_ADDRESS, "bc1xyz")
    window.localStorage.setItem(KEY_ETH_ADDRESS, "0xabc")
    window.localStorage.setItem(KEY_ANCHOR, "anchor-value")

    // When a hard clear runs
    await getResetAuthState()(true)

    // Then no registered database remains and the raw keys are gone
    const remaining = (await global.indexedDB.databases()).map(
      (entry) => entry.name,
    )
    for (const name of registeredNames) {
      expect(remaining).not.toContain(name)
    }
    expect(window.localStorage.getItem(KEY_BTC_ADDRESS)).toBeNull()
    expect(window.localStorage.getItem(KEY_ETH_ADDRESS)).toBeNull()
    expect(window.localStorage.getItem(KEY_ANCHOR)).toBeNull()
  })

  it("should still complete logout when the database wipe throws", async () => {
    // Given every deleteDB call rejects
    await seedRegisteredDatabasesOnDisk()
    window.localStorage.setItem(KEY_BTC_ADDRESS, "bc1xyz")
    window.localStorage.setItem(KEY_ETH_ADDRESS, "0xabc")
    window.localStorage.setItem(KEY_ANCHOR, "anchor-value")
    deleteDbMock.mockRejectedValue(new Error("delete blocked past timeout"))

    // When a hard clear runs
    const result = await getResetAuthState()(true)

    // Then it still resolves (error logged, not rethrown) and the keys are cleared
    expect(result).toBe(true)
    expect(window.localStorage.getItem(KEY_BTC_ADDRESS)).toBeNull()
    expect(window.localStorage.getItem(KEY_ETH_ADDRESS)).toBeNull()
    expect(window.localStorage.getItem(KEY_ANCHOR)).toBeNull()
  })
})
