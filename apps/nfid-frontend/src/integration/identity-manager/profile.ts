// TODO: Write a migration for existing users to go from account => profile as local key
// remove personas key from localstorage and use profile.accounts instead
import { Profile } from "."

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
