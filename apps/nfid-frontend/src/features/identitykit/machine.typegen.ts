// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.IdentityKitRPCMachine.ExecutingRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.ExecutingRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.IdentityKitRPCMachine.ValidateRequest:invocation[0]": {
      type: "done.invoke.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.IdentityKitRPCMachine.ExecutingRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.ExecutingRequest:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]"
      data: unknown
    }
    "error.platform.IdentityKitRPCMachine.ValidateRequest:invocation[0]": {
      type: "error.platform.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    executeRequest:
      | "done.invoke.IdentityKitRPCMachine.ExecutingRequest:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]"
    sendResponse: "done.invoke.IdentityKitRPCMachine.SendResponse:invocation[0]"
    validateRequest: "done.invoke.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: "isSilentRequest"
    services: "executeRequest" | "sendResponse" | "validateRequest"
  }
  eventsCausingActions: {}
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isSilentRequest: "done.invoke.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
  }
  eventsCausingServices: {
    executeRequest:
      | "ON_APPROVE"
      | "done.invoke.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
    sendResponse:
      | "ON_CANCEL"
      | "done.invoke.IdentityKitRPCMachine.ExecutingRequest:invocation[0]"
      | "done.invoke.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.ExecutingRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.HandleSilentRequest:invocation[0]"
      | "error.platform.IdentityKitRPCMachine.ValidateRequest:invocation[0]"
    validateRequest: "ON_REQUEST"
  }
  matchesStates:
    | "ExecutingRequest"
    | "HandleInteractiveRequest"
    | "HandleSilentRequest"
    | "Initializing"
    | "Ready"
    | "SendResponse"
    | "ValidateRequest"
    | "actions"
    | "guards"
    | "services"
  tags: never
}
