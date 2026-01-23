import { Storage } from "@nfid/client-db"

const AUTH_DB_NAME = "authstate"
const OBJECT_STORE_NAME = "ic-keyval"

const WALLET_DB_NAME = "wallets"
const WALLET_STORE_NAME = "wallets-store"

export const KEY_STORAGE_KEY = "identity"
export const KEY_STORAGE_DELEGATION = "delegation"
export const KEY_BTC_ADDRESS = "bitcoin-address"
export const KEY_ETH_ADDRESS = "eth-address"
export const KEY_ANCHOR = "anchor"

export type StoredKey = string | CryptoKeyPair

export const authStorage = new Storage<StoredKey>({
  dbName: AUTH_DB_NAME,
  storeName: OBJECT_STORE_NAME,
})

export const walletStorage = new Storage<StoredKey>({
  dbName: WALLET_DB_NAME,
  storeName: WALLET_STORE_NAME,
})
