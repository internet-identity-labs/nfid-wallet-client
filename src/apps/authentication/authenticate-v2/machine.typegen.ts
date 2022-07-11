// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestDelegate: "RECEIVE_DELEGATE"
    ingestDevice: "REGISTER"
  }
  internalEvents: {
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: "ingestDelegate" | "ingestDevice"
    services: never
    guards: "isDeviceRegistered"
    delays: never
  }
  eventsCausingServices: {}
  eventsCausingGuards: {
    isDeviceRegistered: ""
  }
  eventsCausingDelays: {}
  matchesStates:
    | "DetermineDeviceStatus"
    | "Authenticate"
    | "RemoteAuthenticate"
    | "RegisterDeviceDecider"
    | "RegisterDevice"
    | "AuthorizeApplication"
  tags: never
}
