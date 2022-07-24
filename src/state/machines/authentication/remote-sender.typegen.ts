// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthRequest: "done.invoke.getDataFromPath"
    assignAppMeta: "done.invoke.getAppMeta"
  }
  internalEvents: {
    "done.invoke.getDataFromPath": {
      type: "done.invoke.getDataFromPath"
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
    "error.platform.getDataFromPath": {
      type: "error.platform.getDataFromPath"
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
    "done.invoke.postRemoteDelegationService": {
      type: "done.invoke.postRemoteDelegationService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.postRemoteDelegationService": {
      type: "error.platform.postRemoteDelegationService"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    getDataFromPath: "done.invoke.getDataFromPath"
    getAppMeta: "done.invoke.getAppMeta"
    AuthenticationMachine: "done.invoke.authenticate"
    AuthorizationMachine: "done.invoke.authorize"
    postRemoteDelegationService: "done.invoke.postRemoteDelegationService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    AuthenticationMachine: "done.state.auth-remote-sender.Start"
    getDataFromPath: "xstate.init"
    getAppMeta: "xstate.init"
    AuthorizationMachine: "done.invoke.authenticate"
    postRemoteDelegationService: "done.invoke.authorize"
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
