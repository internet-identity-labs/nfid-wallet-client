import { authStorage } from "@nfid/integration"

import { UserPrefImpl } from "src/integration/user-preferences/impl/user-pref-impl"
import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefService {
  async getUserPreferences(): Promise<UserPreferences> {
    const userPreferences = await authStorage.get("userPreferences")
    if (!userPreferences) {
      return new UserPrefImpl()
    }
    return UserPrefImpl.fromJSON(userPreferences as string)
  }
}

export const userPrefService = new UserPrefService()
