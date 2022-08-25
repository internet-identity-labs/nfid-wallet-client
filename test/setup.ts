/* eslint-disable no-var, no-unused-vars, no-underscore-dangle */
import { TextEncoder } from "util"

export type WebAuthnCredential = {
  credentialId: string
  isResidentCredential: boolean
  privateKey: string
  signCount: number
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Browser {
      addVirtualWebAuth: (
        protocol: string,
        transport: string,
        hasResidentKey: boolean,
        isUserConsenting: boolean,
      ) => Promise<string>
      removeVirtualWebAuth: (authenticatorId: string) => Promise<void>
      getWebauthnCredentials: (
        authenticatorId: string,
      ) => Promise<WebAuthnCredential[]>
      addWebauthnCredential: (
        authenticatorId: string,
        rpId: string,
        credentialId: string,
        isResidentCredential: boolean,
        privateKey: string,
        signCount: number,
        userHandle?: string,
        largeBlob?: string,
      ) => Promise<void>
    }
  }
}

global.TextEncoder = TextEncoder

// Make a proxy of the global Jest expect function so we can test the global
// expect-webdriverio version
// @ts-ignore
global._expect = global.expect
