// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.fetchChallenge": {
      type: "done.invoke.fetchChallenge"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.fetchChallenge": {
      type: "error.platform.fetchChallenge"
      data: unknown
    }
    "error.platform.challengeTimer": {
      type: "error.platform.challengeTimer"
      data: unknown
    }
    "error.platform.registerService": {
      type: "error.platform.registerService"
      data: unknown
    }
    "error.platform.createWebAuthnIdentity": {
      type: "error.platform.createWebAuthnIdentity"
      data: unknown
    }
    "done.invoke.createWebAuthnIdentity": {
      type: "done.invoke.createWebAuthnIdentity"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.AuthWithGoogleMachine": {
      type: "done.invoke.AuthWithGoogleMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "xstate.init": { type: "xstate.init" }
    "done.invoke.challengeTimer": {
      type: "done.invoke.challengeTimer"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "": { type: "" }
    "done.invoke.registerService": {
      type: "done.invoke.registerService"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthWithGoogleMachine": {
      type: "error.platform.AuthWithGoogleMachine"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchChallenge: "done.invoke.fetchChallenge"
    challengeTimer: "done.invoke.challengeTimer"
    registerService: "done.invoke.registerService"
    createWebAuthnIdentity: "done.invoke.createWebAuthnIdentity"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    assignChallenge: "done.invoke.fetchChallenge"
    logServiceError:
      | "error.platform.fetchChallenge"
      | "error.platform.challengeTimer"
      | "error.platform.registerService"
      | "error.platform.createWebAuthnIdentity"
    assignError: "error.platform.registerService"
    assignWebAuthnIdentity: "done.invoke.createWebAuthnIdentity"
    assignAuthSession: "done.invoke.AuthWithGoogleMachine"
  }
  eventsCausingServices: {
    fetchChallenge:
      | "xstate.init"
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.challengeTimer"
      | "FETCH_CAPTCHA"
    challengeTimer: "done.invoke.fetchChallenge"
    registerService: "SUBMIT_CAPTCHA"
    createWebAuthnIdentity: "CREATE_IDENTITY"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
  }
  eventsCausingGuards: {
    authenticated: ""
    isExistingGoogleAccount: "done.invoke.AuthWithGoogleMachine"
  }
  eventsCausingDelays: {}
  matchesStates:
    | "Start"
    | "Start.Challenge"
    | "Start.Challenge.Fetch"
    | "Start.Challenge.Wait"
    | "Start.Register"
    | "Start.Register.CheckAuth"
    | "Start.Register.InitialChallenge"
    | "Start.Register.Captcha"
    | "Start.Register.Register"
    | "Start.Register.CreateIdentity"
    | "AuthWithGoogle"
    | "End"
    | {
        Start?:
          | "Challenge"
          | "Register"
          | {
              Challenge?: "Fetch" | "Wait"
              Register?:
                | "CheckAuth"
                | "InitialChallenge"
                | "Captcha"
                | "Register"
                | "CreateIdentity"
            }
      }
  tags: never
}
