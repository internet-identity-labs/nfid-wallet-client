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
    assignProcedure: "PROCEDURE_CALL"
    nfid_authenticated:
      | ""
      | "done.invoke.NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]"
    nfid_unauthenticated: "SESSION_EXPIRED"
    queueRequest: "PROCEDURE_CALL"
    sendRPCCancelResponse: "CANCEL"
    sendRPCResponse: "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
    updateProcedure:
      | "CANCEL"
      | "done.invoke.NFIDEmbedMachineV2.HANDLE_PROCEDURE.EXECUTE_PROCEDURE:invocation[0]"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    hasProcedure: ""
    isAuthenticated: ""
    isReady: "PROCEDURE_CALL"
  }
  eventsCausingServices: {
    AuthenticationMachine: "" | "SESSION_EXPIRED"
    ExecuteProcedureService: "APPROVE"
    RPCReceiver: "PROCEDURE_CALL" | "xstate.init"
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
