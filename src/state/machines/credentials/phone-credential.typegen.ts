// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchPhoneNumber": {
      type: "done.invoke.fetchPhoneNumber"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.verifyPhoneNumberService": {
      type: "done.invoke.verifyPhoneNumberService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "": { type: "" }
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.verifySmsService": {
      type: "done.invoke.verifySmsService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.fetchPhoneNumber": {
      type: "error.platform.fetchPhoneNumber"
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
    fetchPhoneNumber: "done.invoke.fetchPhoneNumber"
    verifyPhoneNumberService: "done.invoke.verifyPhoneNumberService"
    verifySmsService: "done.invoke.verifySmsService"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignEncryptedPN:
      | "done.invoke.fetchPhoneNumber"
      | "done.invoke.verifyPhoneNumberService"
    assignPhoneNumber: "ENTER_PHONE_NUMBER"
    presentCredential: "done.state.PhoneNumberCredentialProvider.GetPhoneNumber"
  }
  eventsCausingServices: {
    AuthenticationMachine: ""
    fetchPhoneNumber: "done.invoke.AuthenticationMachine"
    verifyPhoneNumberService: "ENTER_PHONE_NUMBER" | "RESEND"
    verifySmsService: "ENTER_SMS_TOKEN"
  }
  eventsCausingGuards: {
    defined: "done.invoke.fetchPhoneNumber"
    bool: "done.invoke.verifySmsService"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Ready"
    | "Authenticate"
    | "GetPhoneNumber"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.VerifyPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.ValidateSMSToken"
    | "GetPhoneNumber.End"
    | "PresentCredential"
    | {
        GetPhoneNumber?:
          | "GetExistingPhoneNumber"
          | "EnterPhoneNumber"
          | "VerifyPhoneNumber"
          | "EnterSMSToken"
          | "ValidateSMSToken"
          | "End"
      }
  tags: never
}
