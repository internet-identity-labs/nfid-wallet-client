import { Storage } from "@nfid/client-db"

import { Profile } from "./types"

export const PROFILE_STORAGE_KEY = "account"

export const profileStorage = new Storage<Profile>({
  dbName: "profile-db",
  storeName: "profile-store",
})
