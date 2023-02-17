type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

interface IChromeOption {
  w3c: boolean // required for JSONWP Local Storage
  args: string[]
  mobileEmulation?: object
}
