import { Account } from ".."
import { NFIDPersona } from "./types"

/**
 * Removes http:// or https:// from input string
 *
 * @param {string} input
 */
export const rmProto = (input: string) => input.replace(/https?:\/\//, "")

/**
 * Removes trailing '/' from input string
 *
 * @param {string} input
 */
export const rmTrailingSlash = (input: string) => input.replace(/\/$/, "")

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
  const filterBy = derivationOrigin ?? hostName

  return personas.filter(({ domain }) => rmProto(domain) === rmProto(filterBy))
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
  const hasProtocol = hostName.includes("https") || hostName.includes("http")
  const origin = hasProtocol ? hostName : `https://${hostName}`

  return `${personaId && personaId !== "0" ? `${personaId}@` : ``}${origin}`
}

export function getAccountDisplayOffset(
  accounts: Array<{ persona_id: string }>,
): number {
  return accounts[0]?.persona_id === "1" ? 0 : 1
}
