// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.EmbedConnectAccountMachine": {
      type: "done.invoke.EmbedConnectAccountMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.SendTransactionService": {
      type: "done.invoke.SendTransactionService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.SignTypedDataService": {
      type: "done.invoke.SignTypedDataService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authenticate": {
      type: "done.invoke.authenticate"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.EmbedConnectAccountMachine": {
      type: "error.platform.EmbedConnectAccountMachine"
      data: unknown
    }
    "error.platform.SendTransactionService": {
      type: "error.platform.SendTransactionService"
      data: unknown
    }
    "error.platform.SignTypedDataService": {
      type: "error.platform.SignTypedDataService"
      data: unknown
    }
    "error.platform.authenticate": {
      type: "error.platform.authenticate"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
    "xstate.stop": { type: "xstate.stop" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.authenticate"
    EmbedConnectAccountMachine: "done.invoke.EmbedConnectAccountMachine"
    SendTransactionService: "done.invoke.SendTransactionService"
    SignTypedDataService: "done.invoke.SignTypedDataService"
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
      | "error.platform.SendTransactionService"
      | "error.platform.SignTypedDataService"
    nfid_authenticated: "done.invoke.authenticate"
    sendRPCResponse:
      | "done.invoke.EmbedConnectAccountMachine"
      | "done.invoke.SendTransactionService"
      | "done.invoke.SignTypedDataService"
      | "error.platform.SendTransactionService"
      | "error.platform.SignTypedDataService"
      | "xstate.stop"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isAuthenticated: "CONNECT_ACCOUNT" | "SEND_TRANSACTION" | "SIGN_TYPED_DATA"
  }
  eventsCausingServices: {
    AuthenticationMachine:
      | "CONNECT_ACCOUNT"
      | "SEND_TRANSACTION"
      | "SIGN_TYPED_DATA"
      | "xstate.init"
    EmbedConnectAccountMachine: "CONNECT_ACCOUNT"
    SendTransactionService: "SEND_TRANSACTION"
    SignTypedDataService: "SIGN_TYPED_DATA"
  }
  matchesStates:
    | "AuthenticationMachine"
    | "ConnectAccount"
    | "Error"
    | "Ready"
    | "SendTransaction"
    | "SignTypedDataV4"
  tags: never
}
