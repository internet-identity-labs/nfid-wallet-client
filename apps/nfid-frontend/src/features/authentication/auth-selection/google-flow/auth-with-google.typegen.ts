
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.signWithGoogleService": { type: "done.invoke.signWithGoogleService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"error.platform.signWithGoogleService": { type: "error.platform.signWithGoogleService"; data: unknown };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "signWithGoogleService": "done.invoke.signWithGoogleService";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "assignAuthSession": "done.invoke.signWithGoogleService";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          "signWithGoogleService": "xstate.init";
        };
        matchesStates: "End" | "FetchKeys";
        tags: never;
      }
  