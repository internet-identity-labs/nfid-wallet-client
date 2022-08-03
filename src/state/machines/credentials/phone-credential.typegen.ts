// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.registerCredentialHandler": {
      type: "done.invoke.registerCredentialHandler"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.AuthenticationMachine": {
      type: "done.invoke.AuthenticationMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
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
    "done.invoke.generateCredential": {
      type: "done.invoke.generateCredential"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "done.invoke.verifySmsService": {
      type: "done.invoke.verifySmsService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.registerCredentialHandler": {
      type: "error.platform.registerCredentialHandler"
      data: unknown
    }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
    "done.invoke.clearAccountData": {
      type: "done.invoke.clearAccountData"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.clearAccountData": {
      type: "error.platform.clearAccountData"
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
    "error.platform.generateCredential": {
      type: "error.platform.generateCredential"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    registerCredentialHandler: "done.invoke.registerCredentialHandler"
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    clearAccountData: "done.invoke.clearAccountData"
    fetchPhoneNumber: "done.invoke.fetchPhoneNumber"
    verifyPhoneNumberService: "done.invoke.verifyPhoneNumberService"
    verifySmsService: "done.invoke.verifySmsService"
    generateCredential: "done.invoke.generateCredential"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignCredentialRequest: "done.invoke.registerCredentialHandler"
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignEncryptedPN:
      | "done.invoke.fetchPhoneNumber"
      | "done.invoke.verifyPhoneNumberService"
    assignPhoneNumber: "ENTER_PHONE_NUMBER"
    presentCredential: "done.invoke.generateCredential"
  }
  eventsCausingServices: {
    registerCredentialHandler: "xstate.init"
    AuthenticationMachine: "done.invoke.registerCredentialHandler"
    clearAccountData: "CLEAR_DATA"
    fetchPhoneNumber:
      | "done.invoke.AuthenticationMachine"
      | "done.state.PhoneNumberCredentialProvider.DevClearData"
    verifyPhoneNumberService: "ENTER_PHONE_NUMBER" | "RESEND"
    verifySmsService: "ENTER_SMS_TOKEN"
    generateCredential: "done.state.PhoneNumberCredentialProvider.GetPhoneNumber"
  }
  eventsCausingGuards: {
    isDev: "done.invoke.AuthenticationMachine"
    defined: "done.invoke.fetchPhoneNumber"
    bool: "done.invoke.verifySmsService"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Ready"
    | "Authenticate"
    | "DevClearData"
    | "DevClearData.Start"
    | "DevClearData.Clear"
    | "DevClearData.End"
    | "GetPhoneNumber"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.VerifyPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.ValidateSMSToken"
    | "GetPhoneNumber.End"
    | "GenerateCredential"
    | "End"
    | {
        DevClearData?: "Start" | "Clear" | "End"
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
