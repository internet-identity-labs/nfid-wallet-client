// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.checkTentativeDevice": {
      type: "done.invoke.checkTentativeDevice"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getIIAuthSessionService": {
      type: "done.invoke.getIIAuthSessionService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.checkTentativeDevice": {
      type: "error.platform.checkTentativeDevice"
      data: unknown
    }
    "error.platform.getIIAuthSessionService": {
      type: "error.platform.getIIAuthSessionService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    checkTentativeDevice: "done.invoke.checkTentativeDevice"
    getIIAuthSessionService: "done.invoke.getIIAuthSessionService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAnchor: "CONNECT_WITH_ANCHOR"
    assignAuthSession:
      | "RECOVER_II_SUCCESS"
      | "done.invoke.checkTentativeDevice"
      | "done.invoke.getIIAuthSessionService"
    assignUserDevice: "ASSIGN_USER_DEVICE"
    assignVerificationCode: "CONNECT_RETRY"
  }
  eventsCausingServices: {
    checkTentativeDevice: "CONNECT_RETRY"
    getIIAuthSessionService: "CREATE_NEW_ANCHOR" | "EXISTING_NFID"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "End"
    | "IIConnectAnchor"
    | "IIConnectAnchorCode"
    | "IICreateNewNFID"
    | "IIRecoveryPhrase"
    | "IIThirdParty"
    | "InitAuthWithII"
  tags: never
}
