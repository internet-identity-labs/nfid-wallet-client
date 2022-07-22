// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {}
  internalEvents: {
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
    "done.invoke.registerWithWebAuthn": {
      type: "done.invoke.registerWithWebAuthn"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.registerWithWebAuthn": {
      type: "error.platform.registerWithWebAuthn"
      data: unknown
    }
    "done.invoke.regsiterWithSecurityKey": {
      type: "done.invoke.regsiterWithSecurityKey"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.regsiterWithSecurityKey": {
      type: "error.platform.regsiterWithSecurityKey"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    registerWithWebAuthn: "done.invoke.registerWithWebAuthn"
    registerWithSecurityKey: "done.invoke.regsiterWithSecurityKey"
  }
  missingImplementations: {
    actions: never
    services: "registerWithWebAuthn" | "registerWithSecurityKey"
    guards: "isMobileWebAuthn"
    delays: never
  }
  eventsCausingServices: {
    registerWithWebAuthn: ""
    registerWithSecurityKey: ""
  }
  eventsCausingGuards: {
    isMobileWebAuthn: ""
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Select"
    | "IsMobileWebAuthn"
    | "RegisterWithWebAuthn"
    | "RegisterWithSecurityKey"
    | "End"
  tags: never
}
