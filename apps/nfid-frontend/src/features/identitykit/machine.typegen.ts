// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "": { type: "" }
    "done.invoke.IdentityKitRPCMachine.Main.Authentication.Authenticate:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.Authentication.Authenticate:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.SendResponse:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.SendResponse:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.IdentityKitRPCMachine.Main.Authentication.Authenticate:invocation[0]"
    RPCReceiverV3: "done.invoke.IdentityKitRPCMachine.RPCReceiverV3:invocation[0]"
    checkAuthenticationStatus: "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
    executeInteractiveMethod: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]"
    executeSilentMethod: "done.invoke.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
    getInteractiveMethodData: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]"
    prepareCancelResponse: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]"
    sendResponse: "done.invoke.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
    validateRequest: "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignComponentData: "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]"
    assignError:
      | "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.InteractiveRequest.PrepareComponentData:invocation[0]"
    assignRequest: "ON_REQUEST"
    assignRequestMetadata: "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    moveQueue:
      | "ON_REQUEST"
      | "done.invoke.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
    prepareFailedResponse: "error.platform.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
    resetActiveRequest:
      | "done.invoke.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.SendResponse:invocation[0]"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    hasActiveRequest: ""
    isRequestProcessing: "ON_REQUEST"
    isSilentRequest:
      | "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    shouldAuthenticate: "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
  }
  eventsCausingServices: {
    AuthenticationMachine: "error.platform.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
    RPCReceiverV3: "xstate.init"
    checkAuthenticationStatus:
      | "ON_BACK"
      | "TRY_AGAIN"
      | "done.invoke.IdentityKitRPCMachine.Main.Authentication.Authenticate:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    executeInteractiveMethod: "ON_APPROVE"
    executeSilentMethod:
      | "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    getInteractiveMethodData:
      | "done.invoke.IdentityKitRPCMachine.Main.Authentication.CheckAuthentication:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    prepareCancelResponse: "ON_CANCEL"
    sendResponse:
      | "done.invoke.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.CancelInteractiveRequest:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.Main.InteractiveRequest.ExecuteInteractiveRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.ExecuteSilentRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.Main.ValidateRequest:invocation[0]"
    validateRequest: ""
  }
  matchesStates:
    | "Main"
    | "Main.Authentication"
    | "Main.Authentication.Authenticate"
    | "Main.Authentication.CheckAuthentication"
    | "Main.ExecuteSilentRequest"
    | "Main.InteractiveRequest"
    | "Main.InteractiveRequest.CancelInteractiveRequest"
    | "Main.InteractiveRequest.Error"
    | "Main.InteractiveRequest.ExecuteInteractiveRequest"
    | "Main.InteractiveRequest.PrepareComponentData"
    | "Main.InteractiveRequest.PromptInteractiveRequest"
    | "Main.Ready"
    | "Main.SendResponse"
    | "Main.ValidateRequest"
    | "RPCReceiverV3"
    | {
        Main?:
          | "Authentication"
          | "ExecuteSilentRequest"
          | "InteractiveRequest"
          | "Ready"
          | "SendResponse"
          | "ValidateRequest"
          | {
              Authentication?: "Authenticate" | "CheckAuthentication"
              InteractiveRequest?:
                | "CancelInteractiveRequest"
                | "Error"
                | "ExecuteInteractiveRequest"
                | "PrepareComponentData"
                | "PromptInteractiveRequest"
            }
      }
  tags: never
}
