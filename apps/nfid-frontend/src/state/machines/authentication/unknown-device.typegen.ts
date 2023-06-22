// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "done.invoke.AuthWithGoogleMachine": {
      type: "done.invoke.AuthWithGoogleMachine"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authWithEmail": {
      type: "done.invoke.authWithEmail"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.authWithII": {
      type: "done.invoke.authWithII"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getMetamaskAuthSession": {
      type: "done.invoke.getMetamaskAuthSession"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.getWalletConnectAuthSession": {
      type: "done.invoke.getWalletConnectAuthSession"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.loginWithAnchor": {
      type: "done.invoke.loginWithAnchor"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "done.invoke.remote": {
      type: "done.invoke.remote"
      data: unknown
      __tip: "See the XState TS docs to learn how to strongly type this."
    }
    "error.platform.AuthWithGoogleMachine": {
      type: "error.platform.AuthWithGoogleMachine"
      data: unknown
    }
    "error.platform.authWithEmail": {
      type: "error.platform.authWithEmail"
      data: unknown
    }
    "error.platform.authWithII": {
      type: "error.platform.authWithII"
      data: unknown
    }
    "error.platform.getMetamaskAuthSession": {
      type: "error.platform.getMetamaskAuthSession"
      data: unknown
    }
    "error.platform.getWalletConnectAuthSession": {
      type: "error.platform.getWalletConnectAuthSession"
      data: unknown
    }
    "error.platform.loginWithAnchor": {
      type: "error.platform.loginWithAnchor"
      data: unknown
    }
    "error.platform.remote": { type: "error.platform.remote"; data: unknown }
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {
    AuthWithEmailMachine: "done.invoke.authWithEmail"
    AuthWithGoogleMachine: "done.invoke.AuthWithGoogleMachine"
    AuthWithIIMachine: "done.invoke.authWithII"
    RemoteReceiverMachine: "done.invoke.remote"
    getMetamaskAuthSession: "done.invoke.getMetamaskAuthSession"
    getWalletConnectAuthSession: "done.invoke.getWalletConnectAuthSession"
    loginWithAnchor: "done.invoke.loginWithAnchor"
  }
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    assignAuthSession:
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.authWithEmail"
      | "done.invoke.authWithII"
      | "done.invoke.getMetamaskAuthSession"
      | "done.invoke.getWalletConnectAuthSession"
      | "done.invoke.loginWithAnchor"
      | "done.invoke.remote"
    assignVerificationEmail: "AUTH_WITH_EMAIL"
    handleError:
      | "error.platform.getMetamaskAuthSession"
      | "error.platform.getWalletConnectAuthSession"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    bool: "done.invoke.remote"
    isExistingAccount:
      | "done.invoke.AuthWithGoogleMachine"
      | "done.invoke.authWithEmail"
      | "done.invoke.authWithII"
      | "done.invoke.getMetamaskAuthSession"
      | "done.invoke.getWalletConnectAuthSession"
    isReturn: "done.invoke.authWithEmail" | "done.invoke.authWithII"
  }
  eventsCausingServices: {
    AuthWithEmailMachine: "AUTH_WITH_EMAIL"
    AuthWithGoogleMachine: "AUTH_WITH_GOOGLE"
    AuthWithIIMachine: "AUTH_WITH_II"
    RemoteReceiverMachine: "AUTH_WITH_REMOTE"
    getMetamaskAuthSession: "AUTH_WITH_METAMASK"
    getWalletConnectAuthSession: "AUTH_WITH_WALLET_CONNECT"
    loginWithAnchor: "AUTH_WITH_EXISTING_ANCHOR"
  }
  matchesStates:
    | "AuthSelection"
    | "AuthWithGoogle"
    | "AuthWithMetamask"
    | "AuthWithWalletConnect"
    | "AuthenticateSameDevice"
    | "EmailAuthentication"
    | "End"
    | "ExistingAnchor"
    | "IIAuthentication"
    | "RemoteAuthentication"
  tags: never
}
