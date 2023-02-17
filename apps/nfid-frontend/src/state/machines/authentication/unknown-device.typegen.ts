
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	internalEvents: {
		"done.invoke.AuthWithGoogleMachine": { type: "done.invoke.AuthWithGoogleMachine"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.authWithII": { type: "done.invoke.authWithII"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.getMetamaskAuthSession": { type: "done.invoke.getMetamaskAuthSession"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.getWalletConnectAuthSession": { type: "done.invoke.getWalletConnectAuthSession"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.isMobileWithWebAuthn": { type: "done.invoke.isMobileWithWebAuthn"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.loginWithAnchor": { type: "done.invoke.loginWithAnchor"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.registration": { type: "done.invoke.registration"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.remote": { type: "done.invoke.remote"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"error.platform.AuthWithGoogleMachine": { type: "error.platform.AuthWithGoogleMachine"; data: unknown };
		"error.platform.authWithII": { type: "error.platform.authWithII"; data: unknown };
		"error.platform.getMetamaskAuthSession": { type: "error.platform.getMetamaskAuthSession"; data: unknown };
		"error.platform.getWalletConnectAuthSession": { type: "error.platform.getWalletConnectAuthSession"; data: unknown };
		"error.platform.isMobileWithWebAuthn": { type: "error.platform.isMobileWithWebAuthn"; data: unknown };
		"error.platform.loginWithAnchor": { type: "error.platform.loginWithAnchor"; data: unknown };
		"error.platform.registration": { type: "error.platform.registration"; data: unknown };
		"error.platform.remote": { type: "error.platform.remote"; data: unknown };
		"xstate.init": { type: "xstate.init" };
	};
	invokeSrcNameMap: {
		"AuthWithGoogleMachine": "done.invoke.AuthWithGoogleMachine";
		"AuthWithIIMachine": "done.invoke.authWithII";
		"RegistrationMachine": "done.invoke.registration";
		"RemoteReceiverMachine": "done.invoke.remote";
		"getMetamaskAuthSession": "done.invoke.getMetamaskAuthSession";
		"getWalletConnectAuthSession": "done.invoke.getWalletConnectAuthSession";
		"isMobileWithWebAuthn": "done.invoke.isMobileWithWebAuthn";
		"loginWithAnchor": "done.invoke.loginWithAnchor";
	};
	missingImplementations: {
		actions: never;
		delays: never;
		guards: never;
		services: never;
	};
	eventsCausingActions: {
		"assignAuthSession": "done.invoke.AuthWithGoogleMachine" | "done.invoke.authWithII" | "done.invoke.getMetamaskAuthSession" | "done.invoke.getWalletConnectAuthSession" | "done.invoke.loginWithAnchor" | "done.invoke.registration" | "done.invoke.remote";
		"handleError": "error.platform.getMetamaskAuthSession" | "error.platform.getWalletConnectAuthSession";
	};
	eventsCausingDelays: {

	};
	eventsCausingGuards: {
		"bool": "done.invoke.isMobileWithWebAuthn" | "done.invoke.remote";
		"isExistingAccount": "done.invoke.AuthWithGoogleMachine" | "done.invoke.authWithII" | "done.invoke.getMetamaskAuthSession" | "done.invoke.getWalletConnectAuthSession";
		"isReturn": "done.invoke.authWithII";
	};
	eventsCausingServices: {
		"AuthWithGoogleMachine": "AUTH_WITH_GOOGLE";
		"AuthWithIIMachine": "AUTH_WITH_II";
		"RegistrationMachine": "done.invoke.AuthWithGoogleMachine" | "done.invoke.authWithII" | "done.invoke.getMetamaskAuthSession" | "done.invoke.getWalletConnectAuthSession" | "done.invoke.isMobileWithWebAuthn";
		"RemoteReceiverMachine": "AUTH_WITH_REMOTE";
		"getMetamaskAuthSession": "AUTH_WITH_METAMASK";
		"getWalletConnectAuthSession": "AUTH_WITH_WALLET_CONNECT";
		"isMobileWithWebAuthn": "xstate.init";
		"loginWithAnchor": "AUTH_WITH_EXISTING_ANCHOR";
	};
	matchesStates: "AuthSelection" | "AuthWithGoogle" | "AuthWithMetamask" | "AuthWithWalletConnect" | "AuthenticateSameDevice" | "End" | "ExistingAnchor" | "IIAuthentication" | "RegistrationMachine" | "RemoteAuthentication" | "Start" | "Start.CheckCapability" | { "Start"?: "CheckCapability"; };
	tags: never;
}
