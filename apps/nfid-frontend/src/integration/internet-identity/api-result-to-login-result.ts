import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"

import { ApiResult } from "frontend/integration/internet-identity"

export type LoginSuccess = {
  tag?: "ok"
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}
export type LoginError = {
  tag: "err"
  title: string
  message: string
  detail?: string
}

export type LoginResult = LoginSuccess | LoginError

export const apiResultToLoginResult = (result: ApiResult): LoginResult => {
  switch (result.kind) {
    case "loginSuccess": {
      return {
        tag: "ok",
        chain: result.chain,
        sessionKey: result.sessionKey,
      }
    }
    case "authFail": {
      return {
        tag: "err",
        title: "Failed to authenticate",
        message:
          "We failed to authenticate you using your security device. If this is the first time you're trying to log in with this device, you have to add it as a new device first.",
        detail: result.error.message,
      }
    }
    case "unknownUser": {
      return {
        tag: "err",
        title: "Unknown Identity Anchor",
        message: `No Passkey found for NFID ${result.userNumber}. If this is the correct number and this browser had previously been trusted, please trust this browser again.`,
        detail: "",
      }
    }
    case "apiError": {
      return {
        tag: "err",
        title: "We couldn't reach Internet Identity",
        message:
          "We failed to call the Internet Identity service, please try again.",
        detail: result.error.message,
      }
    }
    case "registerNoSpace": {
      return {
        tag: "err",
        title: "Failed to register",
        message:
          "Failed to register with Internet Identity, because there is no space left at the moment. We're working on increasing the capacity.",
      }
    }
    case "seedPhraseFail": {
      return {
        tag: "err",
        title: "Invalid Seed Phrase",
        message:
          "Failed to recover using this seedphrase. Did you enter it correctly?",
      }
    }
    default: {
      return {
        tag: "err",
        title: "Unknown error",
        message: "Something went wrong",
      }
    }
  }
}
