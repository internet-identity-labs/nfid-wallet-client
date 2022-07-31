// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.signInWithGoogleService": {
      type: "done.invoke.signInWithGoogleService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.checkRegistrationStatus": {
      type: "done.invoke.checkRegistrationStatus"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "done.invoke.fetchGoogleDeviceService": {
      type: "done.invoke.fetchGoogleDeviceService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchGoogleDeviceService": {
      type: "error.platform.fetchGoogleDeviceService"
      data: unknown
    }
    "error.platform.signInWithGoogleService": {
      type: "error.platform.signInWithGoogleService"
      data: unknown
    }
    "error.platform.checkRegistrationStatus": {
      type: "error.platform.checkRegistrationStatus"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchGoogleDeviceService: "done.invoke.fetchGoogleDeviceService"
    signInWithGoogleService: "done.invoke.signInWithGoogleService"
    checkRegistrationStatus: "done.invoke.checkRegistrationStatus"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.signInWithGoogleService"
    assignRegistrationStatus: "done.invoke.checkRegistrationStatus"
  }
  eventsCausingServices: {
    fetchGoogleDeviceService: "xstate.init"
    signInWithGoogleService: "done.invoke.fetchGoogleDeviceService"
    checkRegistrationStatus: "done.invoke.signInWithGoogleService"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates: "FetchKeys" | "SignIn" | "CheckRegistrationStatus" | "End"
  tags: never
}
