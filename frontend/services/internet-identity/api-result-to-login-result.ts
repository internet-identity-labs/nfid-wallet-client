import { ActorSubclass } from "@dfinity/agent"
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import { _SERVICE as _IDENTITY_MANAGER_SERVICE } from "frontend/services/identity-manager/identity_manager"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"
import { ApiResult, IIConnection } from "./iiConnection"

export type LoginSuccess = {
  tag: "ok"
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
  userNumber: bigint
  internetIdentity: IIConnection
  identityManager: ActorSubclass<_IDENTITY_MANAGER_SERVICE>
  pubsubChannelActor: ActorSubclass<PubsubChannelService>
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
        userNumber: result.userNumber,
        internetIdentity: result.internetIdentity,
        identityManager: result.identityManager,
        pubsubChannelActor: result.pubsubChannelActor,
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
        message: `Failed to find an identity for the Identity Anchor ${result.userNumber}. Please check your Identity Anchor and try again.`,
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
