
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    "done.invoke.authenticate": { type: "done.invoke.authenticate"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.getAppMeta": { type: "done.invoke.getAppMeta"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.getDataFromPath": { type: "done.invoke.getDataFromPath"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.postRemoteDelegationService": { type: "done.invoke.postRemoteDelegationService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "error.platform.authenticate": { type: "error.platform.authenticate"; data: unknown };
    "error.platform.getAppMeta": { type: "error.platform.getAppMeta"; data: unknown };
    "error.platform.getDataFromPath": { type: "error.platform.getDataFromPath"; data: unknown };
    "error.platform.postRemoteDelegationService": { type: "error.platform.postRemoteDelegationService"; data: unknown };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    "AuthenticationMachine": "done.invoke.authenticate";
    "getAppMeta": "done.invoke.getAppMeta";
    "getDataFromPath": "done.invoke.getDataFromPath";
    "postRemoteDelegationService": "done.invoke.postRemoteDelegationService";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    "assignAppMeta": "done.invoke.getAppMeta";
    "assignAuthRequest": "done.invoke.getDataFromPath";
    "assignAuthSession": "done.invoke.authenticate";
  };
  eventsCausingDelays: {

  };
  eventsCausingGuards: {

  };
  eventsCausingServices: {
    "AuthenticationMachine": "done.state.auth-remote-sender.Start";
    "getAppMeta": "xstate.init";
    "getDataFromPath": "xstate.init";
    "postRemoteDelegationService": "done.invoke.authenticate";
  };
  matchesStates: "AuthenticationMachine" | "End" | "PostDelegation" | "Start" | "Start.GetAppMeta" | "Start.GetAppMeta.Done" | "Start.GetAppMeta.Fetch" | "Start.GetAuthRequest" | "Start.GetAuthRequest.Done" | "Start.GetAuthRequest.Fetch" | {
    "Start"?: "GetAppMeta" | "GetAuthRequest" | {
      "GetAppMeta"?: "Done" | "Fetch";
      "GetAuthRequest"?: "Done" | "Fetch";
    };
  };
  tags: never;
}
