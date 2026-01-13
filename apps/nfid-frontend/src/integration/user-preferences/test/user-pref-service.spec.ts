import { authStorage } from "@nfid/integration"

import { userPrefService } from "src/integration/user-preferences/user-pref-service"

describe("userpref service test suite", () => {
  it("should get user preferences", async () => {
    await userPrefService.getUserPreferences().then(async (userPreferences) => {
      expect(userPreferences.isHideZeroBalance()).toBe(false)
      expect(userPreferences.getSlippage()).toBe(2)
      await userPreferences.setHideZeroBalance(true).then(() => {
        userPrefService.getUserPreferences().then((userPreferences) => {
          expect(userPreferences.isHideZeroBalance()).toBe(true)
        })
        authStorage.get("userPreferences").then((userPreferencesString) => {
          expect(userPreferencesString).toBe(
            '{"hideZeroBalance":true,"slippage":2}',
          )
        })
      })
      await userPreferences.setSlippage(3).then(() => {
        userPrefService.getUserPreferences().then((userPreferences) => {
          expect(userPreferences.getSlippage()).toBe(3)
        })
        authStorage.get("userPreferences").then((userPreferencesString) => {
          expect(userPreferencesString).toBe(
            '{"hideZeroBalance":true,"slippage":3}',
          )
        })
      })
    })
  })
})
