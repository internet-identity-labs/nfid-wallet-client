// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignAuthSession: "done.invoke.AuthenticationMachine"
    assignPhoneNumber:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "ENTER_PHONE_NUMBER"
    assignSMSToken: "ENTER_SMS_TOKEN"
    assignError: "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    assignAppDelegate: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.RetrieveDelegate:invocation[0]"
    assignCredential: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.ResolveToken:invocation[0]"
    clearError: "xstate.init"
    presentCredential: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.ResolveToken:invocation[0]"
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
    "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]": {
      type: "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
      data: unknown
    }
    "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.RetrieveDelegate:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.RetrieveDelegate:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.ResolveToken:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.ResolveToken:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]": {
      type: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "error.platform.AuthenticationMachine": {
      type: "error.platform.AuthenticationMachine"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    AuthenticationMachine: "done.invoke.AuthenticationMachine"
    fetchPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
    verifyPhoneNumber: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.EnterSMSToken:invocation[0]"
    verifySMSToken: "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    fetchAppDelegate: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.RetrieveDelegate:invocation[0]"
    resolveToken: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.ResolveToken:invocation[0]"
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
    fetchAppDelegate:
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.GetExistingPhoneNumber:invocation[0]"
      | "done.invoke.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    verifyPhoneNumber:
      | "ENTER_PHONE_NUMBER"
      | "error.platform.PhoneNumberCredentialProvider.GetPhoneNumber.ValidateSMSToken:invocation[0]"
    verifySMSToken: "ENTER_SMS_TOKEN"
    resolveToken: "done.invoke.PhoneNumberCredentialProvider.HandleCredential.ResolveCredential.RetrieveDelegate:invocation[0]"
  }
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | "Authenticate"
    | "GetPhoneNumber"
    | "GetPhoneNumber.GetExistingPhoneNumber"
    | "GetPhoneNumber.EnterPhoneNumber"
    | "GetPhoneNumber.EnterSMSToken"
    | "GetPhoneNumber.ValidateSMSToken"
    | "HandleCredential"
    | "HandleCredential.ResolveCredential"
    | "HandleCredential.ResolveCredential.RetrieveDelegate"
    | "HandleCredential.ResolveCredential.ResolveToken"
    | "HandleCredential.PresentCredential"
    | {
        GetPhoneNumber?:
          | "GetExistingPhoneNumber"
          | "EnterPhoneNumber"
          | "EnterSMSToken"
          | "ValidateSMSToken"
        HandleCredential?:
          | "ResolveCredential"
          | "PresentCredential"
          | { ResolveCredential?: "RetrieveDelegate" | "ResolveToken" }
      }
  tags: never
}
