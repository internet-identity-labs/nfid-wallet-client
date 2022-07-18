// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignDevices: "done.invoke.fetchAuthenticatorDevicesService"
    assignAccountLimit: "done.invoke.fetchAccountLimitService"
  }
  internalEvents: {
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
    "xstate.init": { type: "xstate.init" }
    "error.platform.fetchAuthenticatorDevicesService": {
      type: "error.platform.fetchAuthenticatorDevicesService"
      data: unknown
    }
    "error.platform.fetchAccountLimitService": {
      type: "error.platform.fetchAccountLimitService"
      data: unknown
    }
    "done.invoke.loginService": {
      type: "done.invoke.loginService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.loginService": {
      type: "error.platform.loginService"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchAuthenticatorDevicesService: "done.invoke.fetchAuthenticatorDevicesService"
    fetchAccountLimitService: "done.invoke.fetchAccountLimitService"
    loginService: "done.invoke.loginService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchAuthenticatorDevicesService: "xstate.init"
    fetchAccountLimitService: "xstate.init"
    loginService: "UNLOCK"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.FetchDevices"
    | "Start.FetchDevices.Fetch"
    | "Start.FetchDevices.Done"
    | "Start.FetchAccountLimit"
    | "Start.FetchAccountLimit.Fetch"
    | "Start.FetchAccountLimit.Done"
    | "Authenticate"
    | "Login"
    | "End"
    | {
        Start?:
          | "FetchDevices"
          | "FetchAccountLimit"
          | {
              FetchDevices?: "Fetch" | "Done"
              FetchAccountLimit?: "Fetch" | "Done"
            }
      }
  tags: never
}
