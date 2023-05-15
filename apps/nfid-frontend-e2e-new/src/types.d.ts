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
  btcAddress: string
  ethAddress: string
  account: JSON
  credentials: WebAuthnCredential
  authstate: AuthState
}
interface IChromeOption {
  args: string[]
  mobileEmulation?: object
}
