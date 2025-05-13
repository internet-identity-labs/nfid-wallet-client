import { Storage } from "@nfid/client-db"
import { BTCAddress } from "../types"

const BTC_ADDRESS_DB_NAME = "btc-address-db"
const BTC_ADDRESS_STORE_NAME = "btc-address-store"

export const btcAddressStorage = new Storage<BTCAddress>({
  dbName: BTC_ADDRESS_DB_NAME,
  storeName: BTC_ADDRESS_STORE_NAME,
}) 