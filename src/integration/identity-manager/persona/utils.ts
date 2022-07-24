import { Account } from ".."
import { NFIDPersona } from "./types"

/**
 * Select accounts which pertain to given hostName. Uses dervitationOrigin exclusively if present.
 * @param personas List of personas to be filtered, retrieved from identity manager
 * @param hostName Host name of the connecting application i.e. "dscvr.one"
 * @param derivationOrigin Domain used to derive the delegation, allowing apps to use an alternate origin from the host name
 * @returns List of personas usable for the given domain
 */
export function selectAccounts(
  personas: NFIDPersona[],
  hostName: string,
  derivationOrigin?: string,
) {
  const filteredByDerivationOrigin = personas.filter(
    (persona) =>
      persona.domain === derivationOrigin ||
      persona.domain === `https://${derivationOrigin}`,
  )

  if (filteredByDerivationOrigin.length) return filteredByDerivationOrigin

  return personas.filter(
    (persona) =>
      persona.domain === hostName || persona.domain === `https://${hostName}`,
  )
}

export function getNextAccountId(filteredPersonas: NFIDPersona[]) {
  const highest = filteredPersonas.reduce((last, persona) => {
    const current = parseInt(persona.persona_id, 10)
    return last < current ? current : last
  }, -1)
  return `${highest + 1}`
}

/**
 * Create a new persona/account, incrementing id based on # of existing accounts. Uses dervitationOrigin exclusively if present.
 * @param personas
 * @param hostName
 * @param derivationOrigin
 */
export function createAccount(
  personas: NFIDPersona[],
  hostName: string,
  derivationOrigin?: string,
): Account {
  const newAccountId = getNextAccountId(
    selectAccounts(personas, hostName, derivationOrigin),
  )

  const newPersona: Account = {
    accountId: newAccountId,
    label: `Account ${newAccountId}`,
    domain: derivationOrigin ?? hostName,
  }

  return newPersona
}

export function getScope(hostName: string, personaId?: string) {
  const isProtocolExist =
    hostName.includes("https") || hostName.includes("http")
  const origin = isProtocolExist ? hostName : `https://${hostName}`

  return `${personaId && personaId !== "0" ? `${personaId}@` : ``}${origin}`
}
