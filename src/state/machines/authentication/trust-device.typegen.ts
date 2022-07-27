// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
    "done.invoke.isDeviceRegistered": {
      type: "done.invoke.isDeviceRegistered"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchWebAuthnCapability": {
      type: "done.invoke.fetchWebAuthnCapability"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.registerDeviceWithWebAuthn": {
      type: "error.platform.registerDeviceWithWebAuthn"
      data: unknown
    }
    "done.invoke.hasSecurityKey": {
      type: "done.invoke.hasSecurityKey"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.isDeviceRegistered": {
      type: "error.platform.isDeviceRegistered"
      data: unknown
    }
    "error.platform.fetchWebAuthnCapability": {
      type: "error.platform.fetchWebAuthnCapability"
      data: unknown
    }
    "error.platform.hasSecurityKey": {
      type: "error.platform.hasSecurityKey"
      data: unknown
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
    "error.platform.regsiterWithSecurityKey": {
      type: "error.platform.regsiterWithSecurityKey"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    isDeviceRegistered: "done.invoke.isDeviceRegistered"
    fetchWebAuthnCapability: "done.invoke.fetchWebAuthnCapability"
    hasSecurityKey: "done.invoke.hasSecurityKey"
    registerDeviceWithWebAuthn: "done.invoke.registerDeviceWithWebAuthn"
    registerDeviceWithSecurityKey: "done.invoke.regsiterWithSecurityKey"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {}
  eventsCausingServices: {
    isDeviceRegistered: "xstate.init"
    fetchWebAuthnCapability: "done.invoke.isDeviceRegistered" | "TRUST"
    hasSecurityKey: "done.invoke.fetchWebAuthnCapability"
    registerDeviceWithWebAuthn:
      | "done.invoke.fetchWebAuthnCapability"
      | "error.platform.registerDeviceWithWebAuthn"
    registerDeviceWithSecurityKey: "done.invoke.fetchWebAuthnCapability"
  }
  eventsCausingGuards: {
    bool:
      | "done.invoke.isDeviceRegistered"
      | "done.invoke.fetchWebAuthnCapability"
      | "done.invoke.hasSecurityKey"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "CheckCapability"
    | "CheckCapability.Trusted"
    | "CheckCapability.WebAuthn"
    | "CheckCapability.SecurityKey"
    | "CheckCapability.End"
    | "Select"
    | "Register"
    | "RegisterDeviceWithWebAuthn"
    | "RegisterDeviceWithSecurityKey"
    | "End"
    | { CheckCapability?: "Trusted" | "WebAuthn" | "SecurityKey" | "End" }
  tags: never
}
