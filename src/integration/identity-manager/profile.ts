export interface Profile {
  anchor: string
  name?: string
  phoneNumber?: string
  /**
   * @deprecated
   * */
  skipPersonalize?: boolean
}

export function loadProfileFromLocalStorage(): Profile | undefined {
  const local = window.localStorage.getItem("account")
  if (!local) return
  return JSON.parse(local) as Profile
}

export function setProfile(profile: Profile) {
  window.localStorage.setItem("account", JSON.stringify(profile))
}

export let profile: Profile | undefined = loadProfileFromLocalStorage()
