import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"

describe("userpref service test suite", () => {
  it("should get user preferences", async () => {
    await userPrefService.getUserPreferences().then((userPreferences) => {
      expect(userPreferences.isHideZeroBalance()).toBe(false)
      userPreferences.setHideZeroBalance(true).then(() => {
        userPrefService.getUserPreferences().then((userPreferences2) => {
          expect(userPreferences2.isHideZeroBalance()).toBe(true)
        })
        authStorage.get("userPreferences").then((userPreferencesString) => {
          expect(userPreferencesString).toBe('{"hideZeroBalance":true}')
        })
      })
    })
  })
})
