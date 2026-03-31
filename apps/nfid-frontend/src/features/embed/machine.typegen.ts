// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.NFIDEmbedMachine.AUTH.Authenticate:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachine.AUTH.Authenticate:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.NFIDEmbedMachine.AUTH.CheckAppMeta:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachine.AUTH.CheckAppMeta:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.NFIDEmbedMachine.AUTH.Authenticated:invocation[0]": {
      type: "error.platform.NFIDEmbedMachine.AUTH.Authenticated:invocation[0]"
      data: unknown
    }
    "error.platform.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]": {
      type: "error.platform.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
      data: unknown
    }
    "error.platform.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]": {
      type: "error.platform.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.NFIDEmbedMachine.AUTH.Authenticate:invocation[0]"
    CheckApplicationMeta: "done.invoke.NFIDEmbedMachine.AUTH.CheckAppMeta:invocation[0]"
    CheckAuthState: "done.invoke.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
    ExecuteProcedureService: "done.invoke.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    RPCReceiver: "done.invoke.NFIDEmbedMachine.RPC_RECEIVER:invocation[0]"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAppMeta: "done.invoke.NFIDEmbedMachine.AUTH.CheckAppMeta:invocation[0]"
    assignAuthSession:
      | "done.invoke.NFIDEmbedMachine.AUTH.Authenticate:invocation[0]"
      | "done.invoke.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
    assignError: "error.platform.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    assignProcedure: "RPC_MESSAGE"
    nfid_authenticated:
      | "done.invoke.NFIDEmbedMachine.AUTH.Authenticate:invocation[0]"
      | "done.invoke.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
    nfid_ready: "RPC_MESSAGE" | "xstate.init"
    nfid_unauthenticated:
      | "SESSION_EXPIRED"
      | "error.platform.NFIDEmbedMachine.AUTH.Authenticated:invocation[0]"
    queueRequest: "RPC_MESSAGE"
    sendRPCCancelResponse: "CANCEL" | "CANCEL_ERROR"
    sendRPCResponse: "done.invoke.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    updateProcedure:
      | "CANCEL"
      | "CANCEL_ERROR"
      | "done.invoke.NFIDEmbedMachine.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    hasProcedure: ""
    isAutoApprovable: ""
    isReady: "RPC_MESSAGE"
  }
  eventsCausingServices: {
    AuthenticationMachine:
      | "SESSION_EXPIRED"
      | "error.platform.NFIDEmbedMachine.AUTH.Authenticated:invocation[0]"
      | "error.platform.NFIDEmbedMachine.AUTH.CheckAuthentication:invocation[0]"
    CheckApplicationMeta: "RESET" | "xstate.init"
    CheckAuthState: "done.invoke.NFIDEmbedMachine.AUTH.CheckAppMeta:invocation[0]"
    ExecuteProcedureService:
      | ""
      | "APPROVE"
      | "APPROVE_IC_GET_DELEGATION"
      | "APPROVE_IC_REQUEST_TRANSFER"
    RPCReceiver: "RPC_MESSAGE" | "xstate.init"
  }
  matchesStates:
    | "AUTH"
    | "AUTH.Authenticate"
    | "AUTH.Authenticated"
    | "AUTH.CheckAppMeta"
    | "AUTH.CheckAuthentication"
    | "HANDLE_PROCEDURE"
    | "HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL"
    | "HANDLE_PROCEDURE.ERROR"
    | "HANDLE_PROCEDURE.EXECUTE_PROCEDURE"
    | "HANDLE_PROCEDURE.READY"
    | "RPC_RECEIVER"
    | {
        AUTH?:
          | "Authenticate"
          | "Authenticated"
          | "CheckAppMeta"
          | "CheckAuthentication"
        HANDLE_PROCEDURE?:
          | "AWAIT_PROCEDURE_APPROVAL"
          | "ERROR"
          | "EXECUTE_PROCEDURE"
          | "READY"
      }
  tags: never
}
