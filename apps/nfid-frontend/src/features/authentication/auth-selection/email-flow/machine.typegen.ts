
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.authorizeWithEmail": { type: "done.invoke.authorizeWithEmail"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.checkEmailVerification": { type: "done.invoke.checkEmailVerification"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.sendVerificationEmail": { type: "done.invoke.sendVerificationEmail"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.authorizeWithEmail": { type: "error.platform.authorizeWithEmail"; data: unknown };
"error.platform.checkEmailVerification": { type: "error.platform.checkEmailVerification"; data: unknown };
"error.platform.sendVerificationEmail": { type: "error.platform.sendVerificationEmail"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "authorizeWithEmail": "done.invoke.authorizeWithEmail";
"checkEmailVerification": "done.invoke.checkEmailVerification";
"sendVerificationEmail": "done.invoke.sendVerificationEmail";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "assignAuthSession": "done.invoke.authorizeWithEmail";
"assignEmailDelegation": "done.invoke.checkEmailVerification";
"assignVerificationData": "done.invoke.sendVerificationEmail";
"stopIntervalVerification": "BACK" | "RESEND" | "error.platform.checkEmailVerification";
"toastError": "error.platform.sendVerificationEmail";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isRequestNotExpired": "error.platform.sendVerificationEmail";
        };
        eventsCausingServices: {
          "authorizeWithEmail": "done.invoke.checkEmailVerification";
"checkEmailVerification": "done.invoke.sendVerificationEmail" | "error.platform.sendVerificationEmail";
"sendVerificationEmail": "RESEND" | "xstate.init";
        };
        matchesStates: "Authenticated" | "EmailVerified" | "End" | "Error" | "PendingEmailVerification" | "SendVerificationEmail";
        tags: never;
      }
  