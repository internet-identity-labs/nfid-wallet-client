import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { UserPrefImpl } from "src/integration/user-preferences/impl/user-pref-impl"
import { UserPreferences } from "src/integration/user-preferences/user-preferences"

export class UserPrefService {
  async getUserPreferences(): Promise<UserPreferences> {
    let userPreferences = await authStorage.get("userPreferences")
    if (!userPreferences) {
      return new UserPrefImpl()
    }
    return this.fromJSON(userPreferences as string)
  }

  private fromJSON(json: string): UserPreferences {
    return JSON.parse(json) as UserPreferences
  }
}

export const userPrefService = new UserPrefService()
