// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.signInWithIIService": {
      type: "done.invoke.signInWithIIService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.signInWithIIService": {
      type: "error.platform.signInWithIIService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    signInWithIIService: "done.invoke.signInWithIIService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAnchor: "CONNECT_WITH_ANCHOR"
    assignAuthSession: "done.invoke.signInWithIIService"
  }
  eventsCausingServices: {
    signInWithIIService: "CREATE_NEW_ANCHOR" | "EXISTING_NFID"
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
    | "TrustDevice"
  tags: never
}
