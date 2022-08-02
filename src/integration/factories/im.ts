import { Principal } from "@dfinity/principal"

import { Persona, AccessPoint, Account } from "../actors/im"

/**
 * Generate an account stub.
 * @returns {@link Account}
 */
export function factoryAccount(principal?: Principal): Account {
  return {
    anchor: Math.floor(100_000 * Math.random()),
    accessPoints: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    personas: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    principalId: principal?.toText() || "",
    name: undefined,
    phoneNumber: undefined,
  }
}

/**
 * Generate a persona stub.
 * @returns {@link Persona}
 */
export function factoryPersona(principal?: Principal): Persona {
  return {
    domain: "",
    personaName: "",
    personaId: "",
  }
}

/**
 * Generate an access point stub.
 * @returns {@link AccessPoint}
 */
export function factoryAccessPoint(principal?: Principal): AccessPoint {
  return {
    icon: "string",
    device: "string",
    browser: "string",
    lastUsed: new Date().getTime(),
    principalId: "string",
  }
}
