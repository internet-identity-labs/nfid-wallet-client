// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestUser: "done.invoke.authenticate" | "done.invoke.authorize"
  }
  internalEvents: {
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
    "done.invoke.await": {
      type: "done.invoke.await"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.await": { type: "error.platform.await"; data: unknown }
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
    postReady: "done.invoke.await"
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
    postReady: "xstate.init"
    AuthenticationMachine: "done.invoke.await"
    AuthorizationMachine: "done.invoke.authenticate"
    postDelegation: "done.invoke.authorize"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "AuthenticationMachine"
    | "AuthorizationMachine"
    | "End"
  tags: never
}
