import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"

describe("userpref service test suite", () => {
  it("should get user preferences", async () => {
    await userPrefService.getUserPreferences().then(async (userPreferences) => {
      expect(userPreferences.isHideZeroBalance()).toBe(true)
      expect(userPreferences.getSlippage()).toBe(2)
      await userPreferences.setHideZeroBalance(true).then(() => {
        userPrefService.getUserPreferences().then((userPreferences) => {
          expect(userPreferences.isHideZeroBalance()).toBe(true)
        })
        authStorage.get("userPreferences").then((userPreferencesString) => {
          expect(userPreferencesString).toBe(
            '{"hideZeroBalance":true,"slippage":2,\"testnetEnabled\":true,\"arbitrumEnabled\":true,\"baseEnabled\":true,\"polygonEnabled\":true}',
          )
        })
      })
      await userPreferences.setSlippage(3).then(() => {
        userPrefService.getUserPreferences().then((userPreferences) => {
          expect(userPreferences.getSlippage()).toBe(3)
        })
        authStorage.get("userPreferences").then((userPreferencesString) => {
          expect(userPreferencesString).toBe(
            '{"hideZeroBalance":true,"slippage":3,\"testnetEnabled\":true,\"arbitrumEnabled\":true,\"baseEnabled\":true,\"polygonEnabled\":true}',
          )
        })
      })
    })
  })
})
