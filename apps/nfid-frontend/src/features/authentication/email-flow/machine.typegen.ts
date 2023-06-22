// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.checkEmailVerification": {
      type: "done.invoke.checkEmailVerification"
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
    "error.platform.sendVerificationEmail": {
      type: "error.platform.sendVerificationEmail"
      data: unknown
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    checkEmailVerification: "done.invoke.checkEmailVerification"
    sendVerificationEmail: "done.invoke.sendVerificationEmail"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignVerificationData: "done.invoke.sendVerificationEmail"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    checkEmailVerification: "done.invoke.sendVerificationEmail"
    sendVerificationEmail: "RESEND" | "xstate.init"
  }
  matchesStates:
    | "EmailVerified"
    | "End"
    | "PendingEmailVerification"
    | "SendVerificationEmail"
  tags: never
}
