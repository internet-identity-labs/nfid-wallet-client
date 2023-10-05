// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.registerRequestTransferHandler": {
      type: "done.invoke.registerRequestTransferHandler"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.registerRequestTransferHandler": {
      type: "error.platform.registerRequestTransferHandler"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    registerRequestTransferHandler: "done.invoke.registerRequestTransferHandler"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignBlockHeight: "CONFIRM"
    assignRequestTransferRequest: "done.invoke.registerRequestTransferHandler"
    setBlockHeight: "CONFIRM"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    AuthenticationMachine: "done.invoke.registerRequestTransferHandler"
    registerRequestTransferHandler: "xstate.init"
  }
  matchesStates:
    | "Authenticate"
    | "Confirm"
    | "End"
    | "Ready"
    | "RequestTransfer"
  tags: never
}
