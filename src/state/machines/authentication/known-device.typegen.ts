// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignProfile: "done.invoke.getProfileService"
    assignDevices: "done.invoke.fetchAuthenticatorDevicesService"
    assignAccountLimit: "done.invoke.fetchAccountLimitService"
  }
  internalEvents: {
    "done.invoke.getProfileService": {
      type: "done.invoke.getProfileService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAuthenticatorDevicesService": {
      type: "done.invoke.fetchAuthenticatorDevicesService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAccountLimitService": {
      type: "done.invoke.fetchAccountLimitService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.loginService": {
      type: "done.invoke.loginService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.getProfileService": {
      type: "error.platform.getProfileService"
      data: unknown
    }
    "error.platform.fetchAuthenticatorDevicesService": {
      type: "error.platform.fetchAuthenticatorDevicesService"
      data: unknown
    }
    "error.platform.fetchAccountLimitService": {
      type: "error.platform.fetchAccountLimitService"
      data: unknown
    }
    "error.platform.loginService": {
      type: "error.platform.loginService"
      data: unknown
    }
    "done.invoke.fetchProfileService": {
      type: "done.invoke.fetchProfileService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchProfileService": {
      type: "error.platform.fetchProfileService"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    getProfileService: "done.invoke.getProfileService"
    fetchAuthenticatorDevicesService: "done.invoke.fetchAuthenticatorDevicesService"
    fetchAccountLimitService: "done.invoke.fetchAccountLimitService"
    loginService: "done.invoke.loginService"
    fetchProfileService: "done.invoke.fetchProfileService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    getProfileService: "xstate.init"
    fetchAuthenticatorDevicesService: "done.invoke.getProfileService"
    fetchAccountLimitService: "done.state.KnownDeviceMachine.Start.FetchDevices"
    loginService: "UNLOCK"
    fetchProfileService: "done.invoke.loginService"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.LoadProfile"
    | "Start.FetchDevices"
    | "Start.FetchDevices.Fetch"
    | "Start.FetchDevices.Done"
    | "Start.FetchAccountLimit"
    | "Start.FetchAccountLimit.Fetch"
    | "Start.FetchAccountLimit.Done"
    | "Start.Done"
    | "Authenticate"
    | "Login"
    | "UpdateProfile"
    | "End"
    | {
        Start?:
          | "LoadProfile"
          | "FetchDevices"
          | "FetchAccountLimit"
          | "Done"
          | {
              FetchDevices?: "Fetch" | "Done"
              FetchAccountLimit?: "Fetch" | "Done"
            }
      }
  tags: never
}
