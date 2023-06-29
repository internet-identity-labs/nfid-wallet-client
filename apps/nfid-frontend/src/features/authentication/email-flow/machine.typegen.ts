// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.checkEmailVerification": {
      type: "done.invoke.checkEmailVerification"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.prepareGlobalDelegation": {
      type: "done.invoke.prepareGlobalDelegation"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.sendVerificationEmail": {
      type: "done.invoke.sendVerificationEmail"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.checkEmailVerification": {
      type: "error.platform.checkEmailVerification"
      data: unknown
    }
    "error.platform.prepareGlobalDelegation": {
      type: "error.platform.prepareGlobalDelegation"
      data: unknown
    }
    "error.platform.sendVerificationEmail": {
      type: "error.platform.sendVerificationEmail"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    checkEmailVerification: "done.invoke.checkEmailVerification"
    prepareGlobalDelegation: "done.invoke.prepareGlobalDelegation"
    sendVerificationEmail: "done.invoke.sendVerificationEmail"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignEmailDelegation: "done.invoke.checkEmailVerification"
    assignVerificationData: "done.invoke.sendVerificationEmail"
    toastError: "error.platform.sendVerificationEmail"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isRequestInProgress: "error.platform.sendVerificationEmail"
  }
  eventsCausingServices: {
    checkEmailVerification:
      | "done.invoke.sendVerificationEmail"
      | "error.platform.sendVerificationEmail"
    prepareGlobalDelegation: "done.invoke.checkEmailVerification"
    sendVerificationEmail: "RESEND" | "xstate.init"
  }
  matchesStates:
    | "Authenticated"
    | "EmailVerified"
    | "End"
    | "PendingEmailVerification"
    | "SendVerificationEmail"
  tags: never
}
