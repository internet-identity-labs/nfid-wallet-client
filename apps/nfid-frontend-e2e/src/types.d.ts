type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

type TestUser = {
  seed: string
  icpAddress: string
  btcAddress: string
  ethAddress: string
  account: JSON
  credentials: WebAuthnCredential
}
interface IChromeOption {
  w3c: boolean // required for JSONWP Local Storage
  args: string[]
  mobileEmulation?: object
}
