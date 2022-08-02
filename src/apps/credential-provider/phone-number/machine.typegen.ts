// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    ingestPrincipal: "done.invoke.PhoneNumberCredentialProvider.AuthenticateUser.IngestPrincipal:invocation[0]"
    ingestPhoneNumber:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "ENTER_PHONE_NUMBER"
    ingestSMSToken: "ENTER_SMS_TOKEN"
    ingestError: "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    ingestCredential: "INGEST_CREDENTIAL"
    clearError: "xstate.init"
  }
  internalEvents: {
    "done.invoke.PhoneNumberCredentialProvider.AuthenticateUser.IngestPrincipal:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.AuthenticateUser.IngestPrincipal:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]": {
      type: "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
      data: unknown
    }
    "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    fetchPrincipal: "done.invoke.PhoneNumberCredentialProvider.AuthenticateUser.IngestPrincipal:invocation[0]"
    fetchPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
    verifyPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.EnterSMSToken:invocation[0]"
    verifySMSToken: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    resolveCredential: "done.invoke.PhoneNumberCredentialProvider.HandleCredential:invocation[0]"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchPrincipal: "LOGIN_COMPLETE"
    fetchPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.AuthenticateUser.IngestPrincipal:invocation[0]"
    resolveCredential:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    verifyPhoneNumber:
      | "ENTER_PHONE_NUMBER"
      | "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    verifySMSToken: "ENTER_SMS_TOKEN"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "AuthenticateUser"
    | "AuthenticateUser.Login"
    | "AuthenticateUser.IngestPrincipal"
    | "GetPhoneNumber"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.ValidateSMSToken"
    | "HandleCredential"
    | "HandleCredential.ResolveCredential"
    | "HandleCredential.PresentCredential"
    | {
        AuthenticateUser?: "Login" | "IngestPrincipal"
        GetPhoneNumber?:
          | "GetExistingPhoneNumber"
          | "EnterPhoneNumber"
          | "EnterSMSToken"
          | "ValidateSMSToken"
        HandleCredential?: "ResolveCredential" | "PresentCredential"
      }
  tags: never
}
