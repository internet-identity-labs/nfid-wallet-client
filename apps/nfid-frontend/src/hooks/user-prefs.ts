import { userPrefService } from "frontend/integration/user-preferences/user-pref-service"
import useSWR, { mutate } from "swr"

interface UserPreferencesData {
  hideZeroBalance: boolean
  testnetEnabled: boolean
  arbitrumEnabled: boolean
  baseEnabled: boolean
  polygonEnabled: boolean
  slippage: number
}

const USER_PREFERENCES_KEY = "userPreferences"

const DEFAULT_PREFS: UserPreferencesData = {
  hideZeroBalance: true,
  testnetEnabled: false,
  arbitrumEnabled: true,
  baseEnabled: true,
  polygonEnabled: true,
  slippage: 2,
}

const fetchPrefs = async (): Promise<UserPreferencesData> => {
  const prefs = await userPrefService.getUserPreferences()
  return {
    hideZeroBalance: prefs.isHideZeroBalance(),
    testnetEnabled: prefs.isTestnetEnabled(),
    arbitrumEnabled: prefs.isArbitrumEnabled(),
    baseEnabled: prefs.isBaseEnabled(),
    polygonEnabled: prefs.isPolygonEnabled(),
    slippage: prefs.getSlippage(),
  }
}

const update = async (patch: Partial<UserPreferencesData>) => {
  const prefs = await userPrefService.getUserPreferences()
  const promises: Promise<void>[] = []
  if (patch.hideZeroBalance !== undefined)
    promises.push(prefs.setHideZeroBalance(patch.hideZeroBalance))
  if (patch.testnetEnabled !== undefined)
    promises.push(prefs.setTestnetEnabled(patch.testnetEnabled))
  if (patch.arbitrumEnabled !== undefined)
    promises.push(prefs.setArbitrumEnabled(patch.arbitrumEnabled))
  if (patch.baseEnabled !== undefined)
    promises.push(prefs.setBaseEnabled(patch.baseEnabled))
  if (patch.polygonEnabled !== undefined)
    promises.push(prefs.setPolygonEnabled(patch.polygonEnabled))
  if (patch.slippage !== undefined)
    promises.push(prefs.setSlippage(patch.slippage))

  await Promise.all(promises)

  mutate(
    USER_PREFERENCES_KEY,
    (prev: UserPreferencesData | undefined) => ({
      ...(prev ?? DEFAULT_PREFS),
      ...patch,
    }),
    { revalidate: false },
  )
}

export const useUserPrefs = () => {
  const { data } = useSWR(USER_PREFERENCES_KEY, fetchPrefs, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  const prefs = data ?? DEFAULT_PREFS

  return {
    ...prefs,
    setHideZeroBalance: (v: boolean) => update({ hideZeroBalance: v }),
    setTestnetEnabled: (v: boolean) => update({ testnetEnabled: v }),
    setArbitrumEnabled: (v: boolean) => update({ arbitrumEnabled: v }),
    setBaseEnabled: (v: boolean) => update({ baseEnabled: v }),
    setPolygonEnabled: (v: boolean) => update({ polygonEnabled: v }),
    setSlippage: (v: number) => update({ slippage: v }),
  }
}
