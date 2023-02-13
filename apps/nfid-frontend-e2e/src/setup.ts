/* eslint-disable no-var, no-unused-vars, no-underscore-dangle */
import { TextEncoder, TextDecoder } from "util"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Browser {
      addVirtualWebAuth: (
        protocol?: string,
        transport?: string,
        hasResidentKey?: boolean,
        hasUserVerification?: boolean,
        isUserConsenting?: boolean,
        isUserVerified?: boolean
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
// @ts-ignore
global.TextDecoder = TextDecoder

// Make a proxy of the global Jest expect function so we can test the global
// expect-webdriverio version
// @ts-ignore
global._expect = global.expect
