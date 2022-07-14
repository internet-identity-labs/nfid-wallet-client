// Code allowing third parties to configure their apps will go here

export interface AppMeta {
  name?: string
  logoSrc?: string
  userLimit?: number
  hostname?: string
}

export async function fetchAppUserLimit(hostname: string) {
  return 5
}
