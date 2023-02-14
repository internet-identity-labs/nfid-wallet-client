
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    "done.invoke.authenticate": { type: "done.invoke.authenticate"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.authorize": { type: "done.invoke.authorize"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.checkIsIframe": { type: "done.invoke.checkIsIframe"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.checkIsIframeAllowed": { type: "done.invoke.checkIsIframeAllowed"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.done": { type: "done.invoke.done"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.getAppMeta": { type: "done.invoke.getAppMeta"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.handshake": { type: "done.invoke.handshake"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.trustDeviceMachine": { type: "done.invoke.trustDeviceMachine"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "error.platform.authenticate": { type: "error.platform.authenticate"; data: unknown };
    "error.platform.authorize": { type: "error.platform.authorize"; data: unknown };
    "error.platform.checkIsIframe": { type: "error.platform.checkIsIframe"; data: unknown };
    "error.platform.checkIsIframeAllowed": { type: "error.platform.checkIsIframeAllowed"; data: unknown };
    "error.platform.done": { type: "error.platform.done"; data: unknown };
    "error.platform.getAppMeta": { type: "error.platform.getAppMeta"; data: unknown };
    "error.platform.handshake": { type: "error.platform.handshake"; data: unknown };
    "error.platform.trustDeviceMachine": { type: "error.platform.trustDeviceMachine"; data: unknown };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    "AuthenticationMachine": "done.invoke.authenticate";
    "AuthorizationMachine": "done.invoke.authorize";
    "TrustDeviceMachine": "done.invoke.trustDeviceMachine";
    "checkIsIframe": "done.invoke.checkIsIframe";
    "checkIsIframeAllowed": "done.invoke.checkIsIframeAllowed";
    "getAppMeta": "done.invoke.getAppMeta";
    "handshake": "done.invoke.handshake";
    "postDelegation": "done.invoke.done";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    "assignAppMeta": "done.invoke.getAppMeta";
    "assignAuthRequest": "done.invoke.handshake";
    "assignAuthoSession": "done.invoke.authorize";
    "assignError": "error.platform.handshake";
    "assignIframeNotAllowedError": "done.invoke.checkIsIframeAllowed";
    "assignIsIframe": "done.invoke.checkIsIframe";
  };
  eventsCausingDelays: {

  };
  eventsCausingGuards: {
    "isTrue": "done.invoke.checkIsIframe" | "done.invoke.checkIsIframeAllowed";
    "isWebAuthNSupported": "done.invoke.authorize";
  };
  eventsCausingServices: {
    "AuthenticationMachine": "done.invoke.checkIsIframe" | "done.invoke.checkIsIframeAllowed" | "done.state.idp.Start";
    "AuthorizationMachine": "done.invoke.authenticate";
    "TrustDeviceMachine": "done.invoke.authorize";
    "checkIsIframe": "done.invoke.handshake";
    "checkIsIframeAllowed": "done.invoke.checkIsIframe";
    "getAppMeta": "xstate.init";
    "handshake": "RETRY" | "xstate.init";
    "postDelegation": "done.invoke.authorize" | "done.invoke.trustDeviceMachine";
  };
  matchesStates: "AuthenticationMachine" | "AuthorizationMachine" | "End" | "Error" | "Start" | "Start.GetAppMeta" | "Start.GetAppMeta.Done" | "Start.GetAppMeta.Fetch" | "Start.Handshake" | "Start.Handshake.CheckIsIframe" | "Start.Handshake.CheckIsIframeAllowed" | "Start.Handshake.Done" | "Start.Handshake.Error" | "Start.Handshake.Fetch" | "TrustDevice" | {
    "Start"?: "GetAppMeta" | "Handshake" | {
      "GetAppMeta"?: "Done" | "Fetch";
      "Handshake"?: "CheckIsIframe" | "CheckIsIframeAllowed" | "Done" | "Error" | "Fetch";
    };
  };
  tags: never;
}
