// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.checkIframeSelect": {
      type: "done.invoke.checkIframeSelect"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchWebAuthnPlatformCapability": {
      type: "done.invoke.fetchWebAuthnPlatformCapability"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getIframeWebauthn": {
      type: "done.invoke.getIframeWebauthn"
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
    "error.platform.checkIframeSelect": {
      type: "error.platform.checkIframeSelect"
      data: unknown
    }
    "error.platform.fetchWebAuthnPlatformCapability": {
      type: "error.platform.fetchWebAuthnPlatformCapability"
      data: unknown
    }
    "error.platform.getIframeWebauthn": {
      type: "error.platform.getIframeWebauthn"
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
    checkIframeSelect: "done.invoke.checkIframeSelect"
    fetchWebAuthnPlatformCapability: "done.invoke.fetchWebAuthnPlatformCapability"
    getIframeWebauthn: "done.invoke.getIframeWebauthn"
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
      | "done.invoke.checkIframeSelect"
      | "done.invoke.fetchWebAuthnPlatformCapability"
      | "done.invoke.hasSecurityKey"
      | "done.invoke.isDeviceRegistered"
  }
  eventsCausingServices: {
    checkIframeSelect: "TRUST" | "done.invoke.hasSecurityKey"
    fetchWebAuthnPlatformCapability:
      | "done.invoke.checkIframeSelect"
      | "done.invoke.isDeviceRegistered"
    getIframeWebauthn: "done.invoke.checkIframeSelect"
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
    | "CheckIframeSelect"
    | "End"
    | "IframeSelect"
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
