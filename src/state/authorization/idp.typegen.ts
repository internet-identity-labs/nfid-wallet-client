// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestRequest: "done.invoke.handshake"
    ingestUser: "done.invoke.authenticate" | "done.invoke.authorize"
  }
  internalEvents: {
    "done.invoke.handshake": {
      type: "done.invoke.handshake"
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
    AuthenticationMachine: "done.invoke.authenticate"
    AuthorizationMachine: "done.invoke.authorize"
    postDelegation: "done.invoke.done"
  }
  missingImplementations: {
    actions: "ingestRequest"
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    handshake: "xstate.init"
    AuthenticationMachine: "done.invoke.handshake"
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
