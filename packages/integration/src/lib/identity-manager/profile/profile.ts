import { PROFILE_STORAGE_KEY, profileStorage } from "./storage"
import { Profile } from "./types"

export async function loadProfileFromStorage(): Promise<Profile | undefined> {
  console.debug("loadProfileFromStorage")
  try {
    const profile = await profileStorage.get(PROFILE_STORAGE_KEY)
    if (!profile) return
    console.debug("loadProfileFromStorage", { profile })
    return profile
  } catch (error) {
    console.error("loadProfileFromStorage", { error })
    return
  }
}

export async function setProfileToStorage(profile: Profile) {
  console.debug("setProfileToStorage", { profile })
  try {
    return profileStorage.set(PROFILE_STORAGE_KEY, profile)
  } catch (error) {
    console.error("setProfileToStorage", { error })
  }
}

export async function clearProfileFromStorage() {
  console.debug("clearProfileFromStorage")
  try {
    return profileStorage.remove(PROFILE_STORAGE_KEY)
  } catch (error) {
    console.error("clearProfileFromStorage", { error })
  }
}
