// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchAccountLimitService": {
      type: "done.invoke.fetchAccountLimitService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAuthenticatorDevicesService": {
      type: "done.invoke.fetchAuthenticatorDevicesService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchProfileService": {
      type: "done.invoke.fetchProfileService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getLocalStorageProfileService": {
      type: "done.invoke.getLocalStorageProfileService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.loginService": {
      type: "done.invoke.loginService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchAccountLimitService": {
      type: "error.platform.fetchAccountLimitService"
      data: unknown
    }
    "error.platform.fetchAuthenticatorDevicesService": {
      type: "error.platform.fetchAuthenticatorDevicesService"
      data: unknown
    }
    "error.platform.fetchProfileService": {
      type: "error.platform.fetchProfileService"
      data: unknown
    }
    "error.platform.getLocalStorageProfileService": {
      type: "error.platform.getLocalStorageProfileService"
      data: unknown
    }
    "error.platform.loginService": {
      type: "error.platform.loginService"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    fetchAccountLimitService: "done.invoke.fetchAccountLimitService"
    fetchAuthenticatorDevicesService: "done.invoke.fetchAuthenticatorDevicesService"
    fetchProfileService: "done.invoke.fetchProfileService"
    getLocalStorageProfileService: "done.invoke.getLocalStorageProfileService"
    loginService: "done.invoke.loginService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAccountLimit: "done.invoke.fetchAccountLimitService"
    assignAuthSession: "done.invoke.loginService"
    assignDevices: "done.invoke.fetchAuthenticatorDevicesService"
    assignProfile: "done.invoke.getLocalStorageProfileService"
    logUserStats: "done.invoke.loginService"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    fetchAccountLimitService: "done.state.KnownDeviceMachine.Start.FetchDevices"
    fetchAuthenticatorDevicesService: "done.invoke.getLocalStorageProfileService"
    fetchProfileService: "done.invoke.loginService"
    getLocalStorageProfileService: "xstate.init"
    loginService: "UNLOCK"
  }
  matchesStates:
    | "Authenticate"
    | "End"
    | "Login"
    | "Start"
    | "Start.Done"
    | "Start.FetchAccountLimit"
    | "Start.FetchAccountLimit.Done"
    | "Start.FetchAccountLimit.Fetch"
    | "Start.FetchDevices"
    | "Start.FetchDevices.Done"
    | "Start.FetchDevices.Fetch"
    | "Start.LoadProfile"
    | "UpdateProfile"
    | {
        Start?:
          | "Done"
          | "FetchAccountLimit"
          | "FetchDevices"
          | "LoadProfile"
          | {
              FetchAccountLimit?: "Done" | "Fetch"
              FetchDevices?: "Done" | "Fetch"
            }
      }
  tags: never
}
