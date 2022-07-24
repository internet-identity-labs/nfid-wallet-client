// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthRequest: "done.invoke.getAuthRequestFromPath"
    assignAppMeta: "done.invoke.getAppMeta"
  }
  internalEvents: {
    "done.invoke.getAuthRequestFromPath": {
      type: "done.invoke.getAuthRequestFromPath"
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
    "error.platform.getAuthRequestFromPath": {
      type: "error.platform.getAuthRequestFromPath"
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
    getAuthRequestFromPath: "done.invoke.getAuthRequestFromPath"
    getAppMeta: "done.invoke.getAppMeta"
    AuthenticationMachine: "done.invoke.authenticate"
    AuthorizationMachine: "done.invoke.authorize"
    postDelegate: "done.invoke.done"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    AuthenticationMachine: "done.state.auth-remote-sender.Start"
    getAuthRequestFromPath: "xstate.init"
    getAppMeta: "xstate.init"
    AuthorizationMachine: "done.invoke.authenticate"
    postDelegate: "done.invoke.authorize"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.GetAuthRequest"
    | "Start.GetAuthRequest.Fetch"
    | "Start.GetAuthRequest.Done"
    | "Start.GetAppMeta"
    | "Start.GetAppMeta.Fetch"
    | "Start.GetAppMeta.Done"
    | "AuthenticationMachine"
    | "AuthorizationMachine"
    | "End"
    | {
        Start?:
          | "GetAuthRequest"
          | "GetAppMeta"
          | { GetAuthRequest?: "Fetch" | "Done"; GetAppMeta?: "Fetch" | "Done" }
      }
  tags: never
}
