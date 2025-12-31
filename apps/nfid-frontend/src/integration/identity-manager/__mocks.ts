import { Principal } from "@dfinity/principal"

import {
  AccessPoint,
  Account,
  DeviceType,
  Icon,
  Profile,
  RootWallet,
} from "@nfid/integration"

import {
  AccessPointResponse,
  AccountResponse,
  HTTPAccessPointResponse,
  HTTPAccountResponse,
  PersonaResponse,
} from "../_ic_api/identity_manager.d"

export async function mockExternalAccountResponse(): Promise<HTTPAccountResponse> {
  return {
    data: [
      {
        wallet: { II: null },
        name: [],
        anchor: BigInt(10_000),
        access_points: [],
        personas: [],
        principal_id: "",
        phone_number: [],
        is2fa_enabled: false,
        email: [],
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
    is2fa: false,
    wallet: RootWallet.II,
    anchor: Math.floor(100_000 * Math.random()),
    accessPoints: new Array(Math.floor(Math.random() * 5)).fill(
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
export function factoryPersona(_principal?: Principal): Account {
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
export function factoryAccessPoint(_principal?: Principal): AccessPoint {
  return {
    deviceType: DeviceType.Email,
    icon: Icon.mobile,
    device: "string",
    browser: "string",
    lastUsed: new Date().getTime(),
    principalId: "string",
    credentialId: "string",
  }
}

export function factoryProfile(): Profile {
  return {
    is2fa: false,
    wallet: RootWallet.II,
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

export function factoryPersonaResponse(): PersonaResponse {
  return {
    domain: "example.com",
    persona_name: "my persona",
    persona_id: "0",
  }
}

export function factoryAccessPointResponse(): AccessPointResponse {
  return {
    icon: "mobile",
    device: "string",
    browser: "string",
    last_used: BigInt(new Date().getTime()),
    principal_id: "string",
    device_type: { Email: null },
    credential_id: [],
  }
}

export async function mockCreateAccessPointResponse(): Promise<HTTPAccessPointResponse> {
  return {
    data: [[factoryAccessPointResponse()]],
    error: [],
    status_code: 200,
  }
}

export function factoryAccountResponse(): AccountResponse {
  return {
    wallet: { II: null },
    name: ["Mr. Doolittle"],
    anchor: BigInt(42069),
    access_points: Array(Math.floor(Math.random() * 4))
      .fill(null)
      .map(factoryAccessPointResponse),
    personas: Array(Math.floor(Math.random() * 4))
      .fill(null)
      .map(factoryPersonaResponse),
    principal_id: "aaaaa-aa",
    phone_number: ["123"],
    is2fa_enabled: false,
    email: [],
  }
}

export async function mockGetAccountResponse(): Promise<HTTPAccountResponse> {
  return {
    data: [factoryAccountResponse()],
    error: [],
    status_code: 200,
  }
}
