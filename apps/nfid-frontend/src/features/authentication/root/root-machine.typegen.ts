
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.AuthWithEmailMachine": { type: "done.invoke.AuthWithEmailMachine"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.AuthWithGoogleMachine": { type: "done.invoke.AuthWithGoogleMachine"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.checkIf2FAEnabled": { type: "done.invoke.checkIf2FAEnabled"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.AuthWithEmailMachine": { type: "error.platform.AuthWithEmailMachine"; data: unknown };
"error.platform.AuthWithGoogleMachine": { type: "error.platform.AuthWithGoogleMachine"; data: unknown };
"error.platform.checkIf2FAEnabled": { type: "error.platform.checkIf2FAEnabled"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "AuthWithEmailMachine": "done.invoke.AuthWithEmailMachine";
"AuthWithGoogleMachine": "done.invoke.AuthWithGoogleMachine";
"checkIf2FAEnabled": "done.invoke.checkIf2FAEnabled";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "assignAllowedDevices": "done.invoke.checkIf2FAEnabled";
"assignAuthSession": "AUTHENTICATED" | "done.invoke.AuthWithEmailMachine" | "done.invoke.AuthWithGoogleMachine";
"assignVerificationEmail": "AUTH_WITH_EMAIL";
        };
        eventsCausingDelays: {

        };
        eventsCausingGuards: {
          "is2FAEnabled": "done.invoke.checkIf2FAEnabled";
"isExistingAccount": "done.invoke.AuthWithGoogleMachine";
"isReturn": "done.invoke.AuthWithEmailMachine";
        };
        eventsCausingServices: {
          "AuthWithEmailMachine": "AUTH_WITH_EMAIL";
"AuthWithGoogleMachine": "AUTH_WITH_GOOGLE";
"checkIf2FAEnabled": "done.invoke.AuthWithEmailMachine" | "done.invoke.AuthWithGoogleMachine";
        };
        matchesStates: "AuthSelection" | "AuthWithGoogle" | "EmailAuthentication" | "End" | "OtherSignOptions" | "TwoFA" | "check2FA";
        tags: never;
      }
