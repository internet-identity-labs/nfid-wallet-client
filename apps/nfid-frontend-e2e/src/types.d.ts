type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

interface IChromeOption {
  // w3c: boolean
  args: string[]
  mobileEmulation?: object
}
