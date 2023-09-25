import { WALLET_SCOPE } from "./constants"

export function getScope(hostName: string, personaId?: string) {
  if (hostName === WALLET_SCOPE) return WALLET_SCOPE

  const hasProtocol = hostName.includes("https") || hostName.includes("http")
  const origin = hasProtocol ? hostName : `https://${hostName}`

  return `${personaId && personaId !== "0" ? `${personaId}@` : ``}${origin}`
}
