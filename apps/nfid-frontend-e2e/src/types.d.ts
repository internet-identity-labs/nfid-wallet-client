type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

type AuthState = {
  delegation: string
  identity: string
}

type TestUser = {
  seed: string
  icpAddress: string
  account: { anchor: number }
  credentials: WebAuthnCredential
  authstate: AuthState
}
interface IChromeOption {
  // w3c: boolean // required for JSONWP Local Storage
  args: string[]
  mobileEmulation?: object
}
