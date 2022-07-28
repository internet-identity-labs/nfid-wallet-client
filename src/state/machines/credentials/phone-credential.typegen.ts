// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignPhoneNumber:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "ENTER_PHONE_NUMBER"
    assignCredential: "done.invoke.verifyPhoneNumberService"
    presentCredential:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "done.invoke.verifySmsService"
  }
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.verifyPhoneNumberService": {
      type: "done.invoke.verifyPhoneNumberService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.verifySmsService": {
      type: "done.invoke.verifySmsService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.verifyPhoneNumberService": {
      type: "error.platform.verifyPhoneNumberService"
      data: unknown
    }
    "error.platform.verifySmsService": {
      type: "error.platform.verifySmsService"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    fetchPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
    verifyPhoneNumberService: "done.invoke.verifyPhoneNumberService"
    verifySmsService: "done.invoke.verifySmsService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    AuthenticationMachine: "xstate.init"
    fetchPhoneNumber: "done.invoke.AuthenticationMachine"
    verifyPhoneNumberService: "ENTER_PHONE_NUMBER" | "RESEND"
    verifySmsService: "ENTER_SMS_TOKEN"
  }
  eventsCausingGuards: {
    defined: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
    bool: "done.invoke.verifySmsService"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Authenticate"
    | "GetPhoneNumber"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.VerifyPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.ValidateSMSToken"
    | "HandleCredential"
    | "HandleCredential.PresentCredential"
    | {
        GetPhoneNumber?:
          | "GetExistingPhoneNumber"
          | "EnterPhoneNumber"
          | "VerifyPhoneNumber"
          | "EnterSMSToken"
          | "ValidateSMSToken"
        HandleCredential?: "PresentCredential"
      }
  tags: never
}
