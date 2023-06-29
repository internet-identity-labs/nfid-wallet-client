// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.checkRegistrationStatus": {
      type: "done.invoke.checkRegistrationStatus"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchGoogleDeviceService": {
      type: "done.invoke.fetchGoogleDeviceService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.signInWithGoogleService": {
      type: "done.invoke.signInWithGoogleService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.checkRegistrationStatus": {
      type: "error.platform.checkRegistrationStatus"
      data: unknown
    }
    "error.platform.fetchGoogleDeviceService": {
      type: "error.platform.fetchGoogleDeviceService"
      data: unknown
    }
    "error.platform.signInWithGoogleService": {
      type: "error.platform.signInWithGoogleService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    checkRegistrationStatus: "done.invoke.checkRegistrationStatus"
    fetchGoogleDeviceService: "done.invoke.fetchGoogleDeviceService"
    signInWithGoogleService: "done.invoke.signInWithGoogleService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.signInWithGoogleService"
    assignRegistrationStatus: "done.invoke.checkRegistrationStatus"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    checkRegistrationStatus: "done.invoke.signInWithGoogleService"
    fetchGoogleDeviceService: "xstate.init"
    signInWithGoogleService: "done.invoke.fetchGoogleDeviceService"
  }
  matchesStates: "CheckRegistrationStatus" | "End" | "FetchKeys" | "SignIn"
  tags: never
}
