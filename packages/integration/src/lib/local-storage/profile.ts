import { localStorageWithFallback } from "@nfid/client-db"

import { Profile } from "../identity-manager/profile"

export function loadProfileFromLocalStorage(): Profile | undefined {
  console.debug("loadProfileFromLocalStorage")
  try {
    const local = localStorageWithFallback.getItem("account")
    if (!local) return
    const profile = JSON.parse(local) as Profile
    console.debug("loadProfileFromLocalStorage", { profile })
    return profile
  } catch (error) {
    console.error("loadProfileFromLocalStorage", { error })
    return
  }
}

export function setProfile(profile: Profile) {
  console.debug("setProfile", { profile })
  try {
    localStorageWithFallback.setItem("account", JSON.stringify(profile))
  } catch (error) {
    console.error("setProfile", { error })
  }
}

export function clearProfile() {
  console.debug("clearProfile")
  try {
    localStorageWithFallback.removeItem("account")
  } catch (error) {
    console.error("clearProfile", { error })
  }
}
