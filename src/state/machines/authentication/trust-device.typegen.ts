// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {}
  internalEvents: {
    "done.invoke.fetchWebAuthnCapability": {
      type: "done.invoke.fetchWebAuthnCapability"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
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
    "error.platform.fetchWebAuthnCapability": {
      type: "error.platform.fetchWebAuthnCapability"
      data: unknown
    }
    "done.invoke.registerDeviceWithWebAuthn": {
      type: "done.invoke.registerDeviceWithWebAuthn"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.registerDeviceWithWebAuthn": {
      type: "error.platform.registerDeviceWithWebAuthn"
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
    fetchWebAuthnCapability: "done.invoke.fetchWebAuthnCapability"
    registerDeviceWithWebAuthn: "done.invoke.registerDeviceWithWebAuthn"
    registerDeviceWithSecurityKey: "done.invoke.regsiterWithSecurityKey"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    canBeTrusted: "xstate.init"
    fetchWebAuthnCapability: "TRUST"
    registerDeviceWithWebAuthn: "done.invoke.fetchWebAuthnCapability"
    registerDeviceWithSecurityKey: "done.invoke.fetchWebAuthnCapability"
  }
  eventsCausingGuards: {
    bool: "done.invoke.canBeTrusted" | "done.invoke.fetchWebAuthnCapability"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "CheckCapability"
    | "Select"
    | "Register"
    | "RegisterDeviceWithWebAuthn"
    | "RegisterDeviceWithSecurityKey"
    | "End"
  tags: never
}
