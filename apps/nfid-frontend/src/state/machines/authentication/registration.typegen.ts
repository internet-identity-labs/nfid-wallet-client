
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	internalEvents: {
		"": { type: "" };
		"done.invoke.AuthWithGoogleMachine": { type: "done.invoke.AuthWithGoogleMachine"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.challengeTimer": { type: "done.invoke.challengeTimer"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.createWebAuthnIdentity": { type: "done.invoke.createWebAuthnIdentity"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.fetchChallenge": { type: "done.invoke.fetchChallenge"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.loginWithAnchor": { type: "done.invoke.loginWithAnchor"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.registerService": { type: "done.invoke.registerService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"error.platform.AuthWithGoogleMachine": { type: "error.platform.AuthWithGoogleMachine"; data: unknown };
		"error.platform.challengeTimer": { type: "error.platform.challengeTimer"; data: unknown };
		"error.platform.createWebAuthnIdentity": { type: "error.platform.createWebAuthnIdentity"; data: unknown };
		"error.platform.fetchChallenge": { type: "error.platform.fetchChallenge"; data: unknown };
		"error.platform.loginWithAnchor": { type: "error.platform.loginWithAnchor"; data: unknown };
		"error.platform.registerService": { type: "error.platform.registerService"; data: unknown };
		"xstate.init": { type: "xstate.init" };
	};
	invokeSrcNameMap: {
		"AuthWithGoogleMachine": "done.invoke.AuthWithGoogleMachine";
		"challengeTimer": "done.invoke.challengeTimer";
		"createWebAuthnIdentity": "done.invoke.createWebAuthnIdentity";
		"fetchChallenge": "done.invoke.fetchChallenge";
		"loginWithAnchor": "done.invoke.loginWithAnchor";
		"registerService": "done.invoke.registerService";
	};
	missingImplementations: {
		actions: never;
		delays: never;
		guards: never;
		services: never;
	};
	eventsCausingActions: {
		"assignAuthSession": "done.invoke.AuthWithGoogleMachine" | "done.invoke.loginWithAnchor";
		"assignChallenge": "done.invoke.fetchChallenge";
		"assignError": "error.platform.createWebAuthnIdentity" | "error.platform.loginWithAnchor" | "error.platform.registerService";
		"assignWebAuthnIdentity": "done.invoke.createWebAuthnIdentity";
		"logServiceError": "error.platform.challengeTimer" | "error.platform.createWebAuthnIdentity" | "error.platform.fetchChallenge" | "error.platform.registerService";
		"resetError": "FETCH_CAPTCHA";
	};
	eventsCausingDelays: {

	};
	eventsCausingGuards: {
		"authenticated": "";
		"isExistingGoogleAccount": "done.invoke.AuthWithGoogleMachine";
	};
	eventsCausingServices: {
		"AuthWithGoogleMachine": "AUTH_WITH_GOOGLE";
		"challengeTimer": "done.invoke.fetchChallenge";
		"createWebAuthnIdentity": "CREATE_IDENTITY";
		"fetchChallenge": "BACK" | "FETCH_CAPTCHA" | "done.invoke.AuthWithGoogleMachine" | "done.invoke.challengeTimer" | "xstate.init";
		"loginWithAnchor": "AUTH_WITH_EXISTING_ANCHOR";
		"registerService": "SUBMIT_CAPTCHA";
	};
	matchesStates: "AuthWithGoogle" | "AuthenticateSameDevice" | "End" | "ExistingAnchor" | "Start" | "Start.Challenge" | "Start.Challenge.Fetch" | "Start.Challenge.Wait" | "Start.Register" | "Start.Register.Captcha" | "Start.Register.CheckAuth" | "Start.Register.CreateIdentity" | "Start.Register.InitialChallenge" | "Start.Register.Register" | {
		"Start"?: "Challenge" | "Register" | {
			"Challenge"?: "Fetch" | "Wait";
			"Register"?: "Captcha" | "CheckAuth" | "CreateIdentity" | "InitialChallenge" | "Register";
		};
	};
	tags: never;
}
