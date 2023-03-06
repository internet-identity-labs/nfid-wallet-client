// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.EmbedConnectAccountMachine": {
      type: "done.invoke.EmbedConnectAccountMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.RPCControllerMachine": {
      type: "done.invoke.RPCControllerMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authenticate": {
      type: "done.invoke.authenticate"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.trustDeviceMachine": {
      type: "done.invoke.trustDeviceMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.EmbedConnectAccountMachine": {
      type: "error.platform.EmbedConnectAccountMachine"
      data: unknown
    }
    "error.platform.RPCControllerMachine": {
      type: "error.platform.RPCControllerMachine"
      data: unknown
    }
    "error.platform.authenticate": {
      type: "error.platform.authenticate"
      data: unknown
    }
    "error.platform.trustDeviceMachine": {
      type: "error.platform.trustDeviceMachine"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.authenticate"
    EmbedConnectAccountMachine: "done.invoke.EmbedConnectAccountMachine"
    RPCControllerMachine: "done.invoke.RPCControllerMachine"
    TrustDeviceMachine: "done.invoke.trustDeviceMachine"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.authenticate"
    assignRPCMessage: "CONNECT_ACCOUNT" | "SEND_TRANSACTION" | "SIGN_TYPED_DATA"
    nfid_authenticated: "done.invoke.trustDeviceMachine"
    sendRPCResponse:
      | "done.invoke.EmbedConnectAccountMachine"
      | "done.invoke.RPCControllerMachine"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isAuthenticated:
      | ""
      | "CONNECT_ACCOUNT"
      | "SEND_TRANSACTION"
      | "SIGN_TYPED_DATA"
  }
  eventsCausingServices: {
    AuthenticationMachine:
      | ""
      | "CONNECT_ACCOUNT"
      | "SEND_TRANSACTION"
      | "SIGN_TYPED_DATA"
    EmbedConnectAccountMachine: "CONNECT_ACCOUNT"
    RPCControllerMachine: "SEND_TRANSACTION" | "SIGN_TYPED_DATA"
    TrustDeviceMachine: "done.invoke.authenticate"
  }
  matchesStates:
    | "AuthenticationMachine"
    | "CheckAuthState"
    | "ConnectAccount"
    | "Error"
    | "RPCController"
    | "Ready"
    | "TrustDevice"
  tags: never
}
