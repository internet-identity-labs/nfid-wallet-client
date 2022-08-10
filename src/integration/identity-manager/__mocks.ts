import { Principal } from "@dfinity/principal"

import { AccessPoint, Account, Profile } from "."
import { HTTPAccountResponse } from "../_ic_api/identity_manager.did"

export async function mockExternalAccountResponse(): Promise<HTTPAccountResponse> {
  return {
    data: [
      {
        name: [],
        anchor: BigInt(10_000),
        access_points: [],
        personas: [],
        principal_id: "",
        phone_number: [],
      },
    ],
    error: [],
    status_code: 200,
  }
}

/**
 * Generate an account stub.
 * @returns {@link Account}
 */
export function factoryAccount(principal?: Principal): Profile {
  return {
    anchor: Math.floor(100_000 * Math.random()),
    accessPoints: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    personas: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    accounts: [],
    principalId: principal?.toText() || "",
    name: undefined,
    phoneNumber: undefined,
  }
}

/**
 * Generate a persona stub.
 * @returns {@link Persona}
 */
export function factoryPersona(principal?: Principal): Account {
  return {
    domain: "",
    label: "",
    accountId: "",
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

export function factoryProfile(): Profile {
  return {
    anchor: 42069,
    accessPoints: Array(Math.floor(Math.random() * 4))
      .fill(null)
      .map(factoryAccessPoint),
    accounts: Array(Math.floor(Math.random() * 4))
      .fill(null)
      .map(factoryPersona),
    principalId: "aaaaa-aa",
  }
}
