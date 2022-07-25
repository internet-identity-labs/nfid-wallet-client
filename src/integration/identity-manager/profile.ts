export interface Profile {
  anchor: string
  name?: string
  phoneNumber?: string
  /**
   * @deprecated
   * */
  skipPersonalize?: boolean
}
// TODO: Write a migration for existing users to go from account => profile as local key
// remove personas key from localstorage and use profile.accounts instead

export function loadProfileFromLocalStorage(): Profile | undefined {
  const local = window.localStorage.getItem("account")
  if (!local) return
  return JSON.parse(local) as Profile
}

export function setProfile(profile: Profile) {
  window.localStorage.setItem("account", JSON.stringify(profile))
}
