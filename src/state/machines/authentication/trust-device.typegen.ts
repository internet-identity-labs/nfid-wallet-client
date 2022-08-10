// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchWebAuthnCapability": {
      type: "done.invoke.fetchWebAuthnCapability"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.hasSecurityKey": {
      type: "done.invoke.hasSecurityKey"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.isDeviceRegistered": {
      type: "done.invoke.isDeviceRegistered"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.registerDeviceWithWebAuthn": {
      type: "done.invoke.registerDeviceWithWebAuthn"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.regsiterWithSecurityKey": {
      type: "done.invoke.regsiterWithSecurityKey"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchWebAuthnCapability": {
      type: "error.platform.fetchWebAuthnCapability"
      data: unknown
    }
    "error.platform.hasSecurityKey": {
      type: "error.platform.hasSecurityKey"
      data: unknown
    }
    "error.platform.isDeviceRegistered": {
      type: "error.platform.isDeviceRegistered"
      data: unknown
    }
    "error.platform.registerDeviceWithWebAuthn": {
      type: "error.platform.registerDeviceWithWebAuthn"
      data: unknown
    }
    "error.platform.regsiterWithSecurityKey": {
      type: "error.platform.regsiterWithSecurityKey"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    fetchWebAuthnCapability: "done.invoke.fetchWebAuthnCapability"
    hasSecurityKey: "done.invoke.hasSecurityKey"
    isDeviceRegistered: "done.invoke.isDeviceRegistered"
    registerDeviceWithSecurityKey: "done.invoke.regsiterWithSecurityKey"
    registerDeviceWithWebAuthn: "done.invoke.registerDeviceWithWebAuthn"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {}
  eventsCausingServices: {
    fetchWebAuthnCapability: "TRUST" | "done.invoke.isDeviceRegistered"
    hasSecurityKey: "done.invoke.fetchWebAuthnCapability"
    isDeviceRegistered: "xstate.init"
    registerDeviceWithSecurityKey: "done.invoke.fetchWebAuthnCapability"
    registerDeviceWithWebAuthn:
      | "done.invoke.fetchWebAuthnCapability"
      | "error.platform.registerDeviceWithWebAuthn"
  }
  eventsCausingGuards: {
    bool:
      | "done.invoke.fetchWebAuthnCapability"
      | "done.invoke.hasSecurityKey"
      | "done.invoke.isDeviceRegistered"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "CheckCapability"
    | "CheckCapability.End"
    | "CheckCapability.SecurityKey"
    | "CheckCapability.Trusted"
    | "CheckCapability.WebAuthn"
    | "End"
    | "Register"
    | "RegisterDeviceWithSecurityKey"
    | "RegisterDeviceWithWebAuthn"
    | "Select"
    | { CheckCapability?: "End" | "SecurityKey" | "Trusted" | "WebAuthn" }
  tags: never
}
