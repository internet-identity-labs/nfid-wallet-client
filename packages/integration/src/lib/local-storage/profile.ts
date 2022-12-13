import { Profile } from "../identity-manager/profile"

export function loadProfileFromLocalStorage(): Profile | undefined {
  console.debug("loadProfileFromLocalStorage")
  const local = window.localStorage.getItem("account")
  if (!local) return
  const profile = JSON.parse(local) as Profile
  console.debug("loadProfileFromLocalStorage", { profile })
  return profile
}

export function setProfile(profile: Profile) {
  console.debug("setProfile", { profile })
  window.localStorage.setItem("account", JSON.stringify(profile))
}

export function clearProfile() {
  console.debug("clearProfile")
  window.localStorage.removeItem("account")
}
