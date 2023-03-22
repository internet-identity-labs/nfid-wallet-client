// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]": {
      type: "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]": {
      type: "error.platform.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
    ExecuteProcedureService: "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    RPCReceiver: "done.invoke.NFIDEmbedMachineV2.RPC_RECEIVER:invocation[0]"
    TrustDeviceMachine: "done.invoke.NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
    assignError: "error.platform.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    assignProcedure: "RPC_MESSAGE"
    nfid_authenticated:
      | ""
      | "done.invoke.NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]"
    nfid_unauthenticated: "SESSION_EXPIRED"
    queueRequest: "RPC_MESSAGE"
    sendRPCCancelResponse: "CANCEL" | "CANCEL_ERROR"
    sendRPCResponse: "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    updateProcedure:
      | "CANCEL"
      | "CANCEL_ERROR"
      | "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    hasProcedure: ""
    isAuthenticated: ""
    isReady: "RPC_MESSAGE"
  }
  eventsCausingServices: {
    AuthenticationMachine: "" | "SESSION_EXPIRED"
    ExecuteProcedureService: "APPROVE"
    RPCReceiver: "RPC_MESSAGE" | "xstate.init"
    TrustDeviceMachine: "done.invoke.NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
  }
  matchesStates:
    | "AUTH"
    | "AUTH.Authenticate"
    | "AUTH.Authenticated"
    | "AUTH.CheckAuthentication"
    | "AUTH.TrustDevice"
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
          | "CheckAuthentication"
          | "TrustDevice"
        HANDLE_PROCEDURE?:
          | "AWAIT_PROCEDURE_APPROVAL"
          | "ERROR"
          | "EXECUTE_PROCEDURE"
          | "READY"
      }
  tags: never
}
