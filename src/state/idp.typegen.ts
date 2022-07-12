// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestSignIdentity: "done.state.idp.AuthenticationMachine"
    ingestDelegationChain: "done.state.idp.AuthorizationMachine"
  }
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
    "done.invoke.await": {
      type: "done.invoke.await"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.await": { type: "error.platform.await"; data: unknown }
    "done.invoke.done": {
      type: "done.invoke.done"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.done": { type: "error.platform.done"; data: unknown }
  }
  invokeSrcNameMap: {
    postReady: "done.invoke.await"
    postDelegation: "done.invoke.done"
  }
  missingImplementations: {
    actions: "ingestSignIdentity" | "ingestDelegationChain"
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    postReady: "xstate.init"
    postDelegation: "done.state.idp.AuthorizationMachine"
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
