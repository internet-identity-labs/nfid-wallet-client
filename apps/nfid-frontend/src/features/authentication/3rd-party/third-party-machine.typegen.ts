// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getAppMeta": {
      type: "done.invoke.getAppMeta"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.handshake": {
      type: "done.invoke.handshake"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.postDelegation": {
      type: "done.invoke.postDelegation"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.getAppMeta": {
      type: "error.platform.getAppMeta"
      data: unknown
    }
    "error.platform.handshake": {
      type: "error.platform.handshake"
      data: unknown
    }
    "error.platform.postDelegation": {
      type: "error.platform.postDelegation"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    getAppMeta: "done.invoke.getAppMeta"
    handshake: "done.invoke.handshake"
    postDelegation: "done.invoke.postDelegation"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAppMeta: "done.invoke.getAppMeta"
    assignAuthRequest: "done.invoke.handshake"
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignAuthoSession: "CHOOSE_ACCOUNT"
    assignError: "error.platform.handshake"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    AuthenticationMachine: "done.state.idp.Start"
    getAppMeta: "RESET" | "xstate.init"
    handshake: "RESET" | "RETRY" | "xstate.init"
    postDelegation: "CHOOSE_ACCOUNT"
  }
  matchesStates:
    | "AuthenticationMachine"
    | "Authorization"
    | "End"
    | "Error"
    | "Start"
    | "Start.GetAppMeta"
    | "Start.GetAppMeta.Done"
    | "Start.GetAppMeta.Fetch"
    | "Start.Handshake"
    | "Start.Handshake.Done"
    | "Start.Handshake.Error"
    | "Start.Handshake.Fetch"
    | {
        Start?:
          | "GetAppMeta"
          | "Handshake"
          | {
              GetAppMeta?: "Done" | "Fetch"
              Handshake?: "Done" | "Error" | "Fetch"
            }
      }
  tags: never
}
