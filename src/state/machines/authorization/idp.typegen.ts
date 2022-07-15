// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthRequest: "done.invoke.handshake"
    assignAppMeta: "done.invoke.getAppMeta"
  }
  internalEvents: {
    "done.invoke.handshake": {
      type: "done.invoke.handshake"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getAppMeta": {
      type: "done.invoke.getAppMeta"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authenticate": {
      type: "done.invoke.authenticate"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authorize": {
      type: "done.invoke.authorize"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.handshake": {
      type: "error.platform.handshake"
      data: unknown
    }
    "error.platform.getAppMeta": {
      type: "error.platform.getAppMeta"
      data: unknown
    }
    "error.platform.authenticate": {
      type: "error.platform.authenticate"
      data: unknown
    }
    "error.platform.authorize": {
      type: "error.platform.authorize"
      data: unknown
    }
    "done.invoke.done": {
      type: "done.invoke.done"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.done": { type: "error.platform.done"; data: unknown }
  }
  invokeSrcNameMap: {
    handshake: "done.invoke.handshake"
    getAppMeta: "done.invoke.getAppMeta"
    AuthenticationMachine: "done.invoke.authenticate"
    AuthorizationMachine: "done.invoke.authorize"
    postDelegation: "done.invoke.done"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    AuthenticationMachine: "done.state.idp.Start"
    handshake: "xstate.init"
    getAppMeta: "xstate.init"
    AuthorizationMachine: "done.invoke.authenticate"
    postDelegation: "done.invoke.authorize"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.Handshake"
    | "Start.Handshake.Fetch"
    | "Start.Handshake.Done"
    | "Start.GetAppMeta"
    | "Start.GetAppMeta.Fetch"
    | "Start.GetAppMeta.Done"
    | "AuthenticationMachine"
    | "AuthorizationMachine"
    | "End"
    | {
        Start?:
          | "Handshake"
          | "GetAppMeta"
          | { Handshake?: "Fetch" | "Done"; GetAppMeta?: "Fetch" | "Done" }
      }
  tags: never
}
