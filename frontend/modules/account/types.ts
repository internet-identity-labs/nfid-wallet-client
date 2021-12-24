import { Name, Persona } from "../persona/types"

// Standard HTTP STATUS CODES
type StatusCode = number

interface HTTPResponse<T, E extends {} = {}> {
  data: T
  error: E
  status: StatusCode
}

interface Device {
  pubKeyHash: string
  lastUsed: string // UTC ISO 8601
  make: string // "Apple"
  model: string // "iPhone"
  browser: string // "Safari"
}

interface PhoneNumber {
  value: string
  isVerified: boolean
  valueSalted: string // New
}

interface Email {
  value: string
  isVerified: boolean
}

export interface Account {
  principalId: string
  saltedPrincipalId: string
  isSeedPhraseCopied: boolean
  name: Name
  phoneNumber: PhoneNumber
  email: Email | null
}

// Verify Phonenumber API
declare function verifyPhoneNumber(phoneNumber?: string): HTTPResponse<boolean>
declare function verifyToken(token: string): HTTPResponse<boolean>

// ALL REQUIRE CALLER
// Account API
declare function createAccount(
  record: Omit<Account, "principalId">,
  token: string, // New (SMS token)
): HTTPResponse<Account>
declare function getAccount(): HTTPResponse<Account>
declare function updateAccount(record: Partial<Account>): HTTPResponse<Account>
// declare function deleteAccount(): MPResponse<boolean>;

// Device API
declare function createDevice(device: Device): HTTPResponse<boolean>
declare function readDevices(): HTTPResponse<Device[]>

// Persona API
declare function createPersona(persona: Persona): HTTPResponse<Account>
declare function updatePersona(persona: Partial<Persona>): HTTPResponse<Account>
declare function readPersonas(): HTTPResponse<Persona[]>
