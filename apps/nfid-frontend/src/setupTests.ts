// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import dotenv from "dotenv"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

dotenv.config({ path: ".env.local" })

// Global userAgent Mock
// define userAgent within your tests by
// global.userAgent = 'iPhone'
// https://vincent-benoit.medium.com/how-to-test-useragent-with-jest-inside-a-react-application-cfd87648843a
Object.defineProperty(
  window.navigator,
  "userAgent",
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    },
  }))(window.navigator.userAgent),
)

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
// @ts-ignore
global.TextDecoder = TextDecoder

// @ts-ignore
global.INTERNET_IDENTITY_CANISTER_ID = "nprnb-waaaa-aaaaj-qax4a-cai"
// @ts-ignore
global.IDENTITY_MANAGER_CANISTER_ID = "74gpt-tiaaa-aaaak-aacaa-cai"
// @ts-ignore
global.PUB_SUB_CHANNEL_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"
// @ts-ignore
global.VERIFIER_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"
// @ts-ignore
global.LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"
// @ts-ignore
global.CYCLES_MINTER_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai"
// @ts-ignore
global.VERIFY_PHONE_NUMBER =
  "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/verify/"
// @ts-ignore
global.AWS_SYMMETRIC =
  "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/symmetric/"
// @ts-ignore
global.IC_HOST = "https://ic0.app"
// @ts-ignore
global.II_ENV = "dev"
// @ts-ignore
global.IS_DEV = ""
// @ts-ignore
global.IS_E2E_TEST = false
// @ts-ignore
global.GOOGLE_CLIENT_ID =
  "339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com"
// @ts-ignore
global.SIGNIN_GOOGLE = "/signin"
// @ts-ignore
global.CURRCONV_TOKEN = process.env.CURRCONV_TOKEN
