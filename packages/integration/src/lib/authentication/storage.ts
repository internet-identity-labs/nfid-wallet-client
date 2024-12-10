import { Storage } from "@nfid/client-db"

const AUTH_DB_NAME = "authstate"
const OBJECT_STORE_NAME = "ic-keyval"

export const KEY_STORAGE_KEY = "identity"
export const KEY_STORAGE_DELEGATION = "delegation"

export type StoredKey = string | CryptoKeyPair

export const authStorage = new Storage<StoredKey>({
  dbName: AUTH_DB_NAME,
  storeName: OBJECT_STORE_NAME,
})
