import { TtlStorage } from "@nfid/client-db"

const DOMAIN_KEY_DB_NAME = "domainkey-db"
const OBJECT_STORE_NAME = "domainkey-store"

export type StoredKey = string | CryptoKeyPair

export const domainKeyStorage = new TtlStorage<string>({
  dbName: DOMAIN_KEY_DB_NAME,
  storeName: OBJECT_STORE_NAME,
})
