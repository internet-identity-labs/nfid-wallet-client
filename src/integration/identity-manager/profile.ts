export interface Profile {
  anchor: string
  name?: string
  phoneNumber?: string
  /**
   * @deprecated
   * */
  skipPersonalize?: boolean
}

export function fetchProfile(): Profile | undefined {
  const local = window.localStorage.getItem("profile")
  if (!local) return
  return JSON.parse(local) as Profile
}

export function setProfile(profile: Profile) {
  window.localStorage.setItem("profile", JSON.stringify(profile))
}

export let profile: Profile | undefined = fetchProfile()
