// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignDevices: "done.invoke.fetchAuthenticatorDevicesService"
    assignAccountLimit: "done.invoke.fetchAccountLimit"
  }
  internalEvents: {
    "done.invoke.fetchAuthenticatorDevicesService": {
      type: "done.invoke.fetchAuthenticatorDevicesService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchAccountLimit": {
      type: "done.invoke.fetchAccountLimit"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.fetchAuthenticatorDevicesService": {
      type: "error.platform.fetchAuthenticatorDevicesService"
      data: unknown
    }
    "error.platform.fetchAccountLimit": {
      type: "error.platform.fetchAccountLimit"
      data: unknown
    }
    "done.invoke.login": {
      type: "done.invoke.login"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.login": { type: "error.platform.login"; data: unknown }
  }
  invokeSrcNameMap: {
    fetchAuthenticatorDevicesService: "done.invoke.fetchAuthenticatorDevicesService"
    fetchAccountLimit: "done.invoke.fetchAccountLimit"
    login: "done.invoke.login"
  }
  missingImplementations: {
    actions: never
    services: "login"
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchAuthenticatorDevicesService: "xstate.init"
    fetchAccountLimit: "xstate.init"
    login: "UNLOCK"
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
