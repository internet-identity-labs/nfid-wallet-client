// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.CheckoutMachine": {
      type: "done.invoke.CheckoutMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.EmbedConnectAccountMachine": {
      type: "done.invoke.EmbedConnectAccountMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.SignMessageMachine": {
      type: "done.invoke.SignMessageMachine"
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
    "error.platform.CheckoutMachine": {
      type: "error.platform.CheckoutMachine"
      data: unknown
    }
    "error.platform.EmbedConnectAccountMachine": {
      type: "error.platform.EmbedConnectAccountMachine"
      data: unknown
    }
    "error.platform.SignMessageMachine": {
      type: "error.platform.SignMessageMachine"
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
    CheckoutMachine: "done.invoke.CheckoutMachine"
    EmbedConnectAccountMachine: "done.invoke.EmbedConnectAccountMachine"
    SignMessageMachine: "done.invoke.SignMessageMachine"
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
    assingError:
      | "error.platform.CheckoutMachine"
      | "error.platform.SignMessageMachine"
    nfid_authenticated: "done.invoke.trustDeviceMachine"
    sendRPCResponse:
      | "done.invoke.CheckoutMachine"
      | "done.invoke.EmbedConnectAccountMachine"
      | "done.invoke.SignMessageMachine"
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
    CheckoutMachine: "SEND_TRANSACTION"
    EmbedConnectAccountMachine: "CONNECT_ACCOUNT"
    SignMessageMachine: "SIGN_TYPED_DATA"
    TrustDeviceMachine: "done.invoke.authenticate"
  }
  matchesStates:
    | "AuthenticationMachine"
    | "CheckAuthState"
    | "CheckoutMachine"
    | "ConnectAccount"
    | "Error"
    | "Ready"
    | "SignTypedDataV4"
    | "TrustDevice"
  tags: never
}
