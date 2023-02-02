type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

interface IChromeOption {
  args: string[]
  mobileEmulation?: object
}
