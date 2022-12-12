// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchWebAuthnPlatformCapability": {
      type: "done.invoke.fetchWebAuthnPlatformCapability"
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
    "error.platform.fetchWebAuthnPlatformCapability": {
      type: "error.platform.fetchWebAuthnPlatformCapability"
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
    fetchWebAuthnPlatformCapability: "done.invoke.fetchWebAuthnPlatformCapability"
    hasSecurityKey: "done.invoke.hasSecurityKey"
    isDeviceRegistered: "done.invoke.isDeviceRegistered"
    registerDeviceWithSecurityKey: "done.invoke.regsiterWithSecurityKey"
    registerDeviceWithWebAuthn: "done.invoke.registerDeviceWithWebAuthn"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {}
  eventsCausingDelays: {}
  eventsCausingGuards: {
    bool:
      | "done.invoke.fetchWebAuthnPlatformCapability"
      | "done.invoke.hasSecurityKey"
      | "done.invoke.isDeviceRegistered"
  }
  eventsCausingServices: {
    fetchWebAuthnPlatformCapability: "TRUST" | "done.invoke.isDeviceRegistered"
    hasSecurityKey: "done.invoke.fetchWebAuthnPlatformCapability"
    isDeviceRegistered: "xstate.init"
    registerDeviceWithSecurityKey: "done.invoke.fetchWebAuthnPlatformCapability"
    registerDeviceWithWebAuthn:
      | "done.invoke.fetchWebAuthnPlatformCapability"
      | "error.platform.registerDeviceWithWebAuthn"
  }
  matchesStates:
    | "CheckCapability"
    | "CheckCapability.End"
    | "CheckCapability.SecurityKey"
    | "CheckCapability.Trusted"
    | "CheckCapability.WebAuthnPlatformCapability"
    | "End"
    | "Register"
    | "RegisterDeviceWithSecurityKey"
    | "RegisterDeviceWithWebAuthn"
    | "Select"
    | {
        CheckCapability?:
          | "End"
          | "SecurityKey"
          | "Trusted"
          | "WebAuthnPlatformCapability"
      }
  tags: never
}
