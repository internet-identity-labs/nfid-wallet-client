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
    "done.invoke.EmbedControllerMachine": {
      type: "done.invoke.EmbedControllerMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.RPCService": {
      type: "done.invoke.RPCService"
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
    "error.platform.EmbedControllerMachine": {
      type: "error.platform.EmbedControllerMachine"
      data: unknown
    }
    "error.platform.RPCService": {
      type: "error.platform.RPCService"
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
    EmbedControllerMachine: "done.invoke.EmbedControllerMachine"
    RPCService: "done.invoke.RPCService"
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
    assignError:
      | "error.platform.EmbedConnectAccountMachine"
      | "error.platform.EmbedControllerMachine"
      | "error.platform.authenticate"
      | "error.platform.trustDeviceMachine"
    assignRPCMessage: "CONNECT_ACCOUNT" | "SEND_TRANSACTION" | "SIGN_TYPED_DATA"
    nfid_authenticated: "done.invoke.trustDeviceMachine"
    sendRPCResponse:
      | "done.invoke.EmbedConnectAccountMachine"
      | "done.invoke.EmbedControllerMachine"
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
    EmbedControllerMachine: "SEND_TRANSACTION" | "SIGN_TYPED_DATA"
    RPCService:
      | ""
      | "done.invoke.EmbedConnectAccountMachine"
      | "done.invoke.EmbedControllerMachine"
      | "done.invoke.trustDeviceMachine"
    TrustDeviceMachine: "done.invoke.authenticate"
  }
  matchesStates:
    | "AuthenticationMachine"
    | "CheckAuthState"
    | "ConnectAccount"
    | "EmbedController"
    | "Error"
    | "Ready"
    | "TrustDevice"
  tags: never
}
