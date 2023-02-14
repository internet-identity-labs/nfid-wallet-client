
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    "done.invoke.createAccountService": { type: "done.invoke.createAccountService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.fetchAccountLimitService": { type: "done.invoke.fetchAccountLimitService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.fetchAccountsService": { type: "done.invoke.fetchAccountsService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "done.invoke.fetchDelegateService": { type: "done.invoke.fetchDelegateService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
    "error.platform.createAccountService": { type: "error.platform.createAccountService"; data: unknown };
    "error.platform.fetchAccountLimitService": { type: "error.platform.fetchAccountLimitService"; data: unknown };
    "error.platform.fetchAccountsService": { type: "error.platform.fetchAccountsService"; data: unknown };
    "error.platform.fetchDelegateService": { type: "error.platform.fetchDelegateService"; data: unknown };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    "createAccountService": "done.invoke.createAccountService";
    "fetchAccountLimitService": "done.invoke.fetchAccountLimitService";
    "fetchAccountsService": "done.invoke.fetchAccountsService";
    "fetchDelegateService": "done.invoke.fetchDelegateService";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    "assignAccounts": "done.invoke.fetchAccountsService";
    "assignUserLimit": "done.invoke.fetchAccountLimitService";
    "handleAccounts": "done.invoke.fetchAccountsService";
  };
  eventsCausingDelays: {

  };
  eventsCausingGuards: {

  };
  eventsCausingServices: {
    "createAccountService": "CREATE_ACCOUNT";
    "fetchAccountLimitService": "xstate.init";
    "fetchAccountsService": "done.invoke.fetchAccountLimitService";
    "fetchDelegateService": "SELECT_ACCOUNT" | "done.invoke.createAccountService";
  };
  matchesStates: "CreateAccount" | "End" | "FetchAccounts" | "GetDelegation" | "PresentAccounts" | "Start";
  tags: never;
}
