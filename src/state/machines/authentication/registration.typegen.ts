// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  eventsCausingActions: {
    assignChallenge: "done.invoke.fetchChallenge"
    assignError: "error.platform.register"
    assignWebAuthnIdentity: "done.invoke.createWebAuthnIdentity"
  }
  internalEvents: {
    "done.invoke.fetchChallenge": {
      type: "done.invoke.fetchChallenge"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.register": {
      type: "error.platform.register"
      data: unknown
    }
    "done.invoke.createWebAuthnIdentity": {
      type: "done.invoke.createWebAuthnIdentity"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.challengeTimer": {
      type: "done.invoke.challengeTimer"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "": { type: "" }
    "xstate.init": { type: "xstate.init" }
    "error.platform.fetchChallenge": {
      type: "error.platform.fetchChallenge"
      data: unknown
    }
    "error.platform.challengeTimer": {
      type: "error.platform.challengeTimer"
      data: unknown
    }
    "done.invoke.register": {
      type: "done.invoke.register"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.createWebAuthnIdentity": {
      type: "error.platform.createWebAuthnIdentity"
      data: unknown
    }
  }
  invokeSrcNameMap: {
    fetchChallenge: "done.invoke.fetchChallenge"
    challengeTimer: "done.invoke.challengeTimer"
    register: "done.invoke.register"
    createWebAuthnIdentity: "done.invoke.createWebAuthnIdentity"
  }
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {
    fetchChallenge: "done.invoke.challengeTimer" | "FETCH_CAPTCHA"
    challengeTimer: "done.invoke.fetchChallenge"
    createWebAuthnIdentity: "CREATE_IDENTITY"
    register: "SUBMIT_CAPTCHA"
  }
  eventsCausingGuards: {
    authenticated: ""
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
