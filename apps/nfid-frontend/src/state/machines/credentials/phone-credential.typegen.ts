// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.clearAccountData": {
      type: "done.invoke.clearAccountData"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.fetchPhoneNumber": {
      type: "done.invoke.fetchPhoneNumber"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.generateCredential": {
      type: "done.invoke.generateCredential"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.registerCredentialHandler": {
      type: "done.invoke.registerCredentialHandler"
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
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "error.platform.clearAccountData": {
      type: "error.platform.clearAccountData"
      data: unknown
    }
    "error.platform.fetchPhoneNumber": {
      type: "error.platform.fetchPhoneNumber"
      data: unknown
    }
    "error.platform.generateCredential": {
      type: "error.platform.generateCredential"
      data: unknown
    }
    "error.platform.registerCredentialHandler": {
      type: "error.platform.registerCredentialHandler"
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
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    clearAccountData: "done.invoke.clearAccountData"
    fetchPhoneNumber: "done.invoke.fetchPhoneNumber"
    generateCredential: "done.invoke.generateCredential"
    registerCredentialHandler: "done.invoke.registerCredentialHandler"
    verifyPhoneNumberService: "done.invoke.verifyPhoneNumberService"
    verifySmsService: "done.invoke.verifySmsService"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignCredentialRequest: "done.invoke.registerCredentialHandler"
    assignEncryptedPN:
      | "done.invoke.fetchPhoneNumber"
      | "done.invoke.verifyPhoneNumberService"
    assignPhoneNumber: "ENTER_PHONE_NUMBER"
    presentCredential: "done.invoke.generateCredential"
    rejectCredential: "REJECT"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    bool: "done.invoke.verifySmsService"
    defined: "done.invoke.fetchPhoneNumber"
    isDev: "done.invoke.AuthenticationMachine"
  }
  eventsCausingServices: {
    AuthenticationMachine: "done.invoke.registerCredentialHandler"
    clearAccountData: "CLEAR_DATA"
    fetchPhoneNumber:
      | "done.invoke.AuthenticationMachine"
      | "done.state.PhoneNumberCredentialProvider.DevClearData"
    generateCredential: "CONSENT"
    registerCredentialHandler: "xstate.init"
    verifyPhoneNumberService: "ENTER_PHONE_NUMBER" | "RESEND"
    verifySmsService: "ENTER_SMS_TOKEN"
  }
  matchesStates:
    | "Authenticate"
    | "Consent"
    | "DevClearData"
    | "DevClearData.Clear"
    | "DevClearData.End"
    | "DevClearData.Start"
    | "End"
    | "GenerateCredential"
    | "GetPhoneNumber"
    | "GetPhoneNumber.End"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.ValidateSMSToken"
    | "GetPhoneNumber.VerifyPhoneNumber"
    | "Ready"
    | {
        DevClearData?: "Clear" | "End" | "Start"
        GetPhoneNumber?:
          | "End"
          | "EnterPhoneNumber"
          | "EnterSMSToken"
          | "GetExistingPhoneNumber"
          | "ValidateSMSToken"
          | "VerifyPhoneNumber"
      }
  tags: never
}
