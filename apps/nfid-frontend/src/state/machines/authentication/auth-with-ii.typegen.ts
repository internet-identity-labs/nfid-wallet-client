// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.assignAuthSession": {
      type: "done.invoke.assignAuthSession"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.checkRegistrationStatus": {
      type: "done.invoke.checkRegistrationStatus"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.signInWithIIService": {
      type: "done.invoke.signInWithIIService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.assignAuthSession": {
      type: "error.platform.assignAuthSession"
      data: unknown
    }
    "error.platform.checkRegistrationStatus": {
      type: "error.platform.checkRegistrationStatus"
      data: unknown
    }
    "error.platform.signInWithIIService": {
      type: "error.platform.signInWithIIService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    assignAuthSession: "done.invoke.assignAuthSession"
    checkRegistrationStatus: "done.invoke.checkRegistrationStatus"
    signInWithIIService: "done.invoke.signInWithIIService"
  }
  missingImplementations: {
    actions: never
    services: "assignAuthSession"
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAnchor: "CONNECT_WITH_ANCHOR"
    assignAuthSession: "RECOVER_II_SUCCESS" | "done.invoke.signInWithIIService"
    assignRegistrationStatus: "done.invoke.checkRegistrationStatus"
  }
  eventsCausingServices: {
    assignAuthSession: never
    checkRegistrationStatus: "RECOVER_II_SUCCESS"
    signInWithIIService: "CREATE_NEW_ANCHOR" | "EXISTING_NFID"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "CheckRegistrationStatus"
    | "End"
    | "IIConnectAnchor"
    | "IIConnectAnchorCode"
    | "IICreateNewNFID"
    | "IIRecoveryPhrase"
    | "IIThirdParty"
    | "InitAuthWithII"
    | "TrustDevice"
  tags: never
}
