// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {}
  internalEvents: {
    "": { type: "" }
    "done.invoke.canBeTrusted": {
      type: "done.invoke.canBeTrusted"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.canBeTrusted": {
      type: "error.platform.canBeTrusted"
      data: unknown
    }
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
    canBeTrusted: "done.invoke.canBeTrusted"
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
    canBeTrusted: "xstate.init"
    registerWithWebAuthn: ""
    registerWithSecurityKey: ""
  }
  eventsCausingGuards: {
    bool: "done.invoke.canBeTrusted"
    isMobileWebAuthn: ""
  }
  eventsCausingDelays: {}
  matchesStates:
    | "CheckCapability"
    | "Select"
    | "IsMobileWebAuthn"
    | "RegisterWithWebAuthn"
    | "RegisterWithSecurityKey"
    | "End"
  tags: never
}
