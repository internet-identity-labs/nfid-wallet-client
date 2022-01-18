import { ActorSubclass } from "@dfinity/agent"
import { _SERVICE as _IDENTITY_MANAGER_SERVICE } from "frontend/generated/identity_manager"
import { _SERVICE as KeysyncService } from "frontend/modules/keysync/keysync.did"
import { _SERVICE as VaultService } from "frontend/modules/vault/vault.did"
import { ApiResult, IIConnection } from "./iiConnection"

export type LoginSuccess = {
  tag: "ok"
  userNumber: bigint
  connection: IIConnection
  identityManager: ActorSubclass<_IDENTITY_MANAGER_SERVICE>
  keysyncActor: ActorSubclass<KeysyncService>
  vaultActor: ActorSubclass<VaultService>
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
        userNumber: result.userNumber,
        connection: result.connection,
        identityManager: result.identityManager,
        keysyncActor: result.keysyncActor,
        vaultActor: result.vaultActor,
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
  }
}
