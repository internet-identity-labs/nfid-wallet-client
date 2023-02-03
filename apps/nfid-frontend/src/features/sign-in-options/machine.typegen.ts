
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	internalEvents: {
		"done.invoke.checkRegistrationStatus": { type: "done.invoke.checkRegistrationStatus"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.checkTentativeDevice": { type: "done.invoke.checkTentativeDevice"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.createTentativeDevice": { type: "done.invoke.createTentativeDevice"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.getIIAuthSessionService": { type: "done.invoke.getIIAuthSessionService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"error.platform.checkRegistrationStatus": { type: "error.platform.checkRegistrationStatus"; data: unknown };
		"error.platform.checkTentativeDevice": { type: "error.platform.checkTentativeDevice"; data: unknown };
		"error.platform.createTentativeDevice": { type: "error.platform.createTentativeDevice"; data: unknown };
		"error.platform.getIIAuthSessionService": { type: "error.platform.getIIAuthSessionService"; data: unknown };
		"xstate.init": { type: "xstate.init" };
	};
	invokeSrcNameMap: {
		"checkRegistrationStatus": "done.invoke.checkRegistrationStatus";
		"checkTentativeDevice": "done.invoke.checkTentativeDevice";
		"createTentativeDevice": "done.invoke.createTentativeDevice";
		"getIIAuthSessionService": "done.invoke.getIIAuthSessionService";
	};
	missingImplementations: {
		actions: never;
		delays: never;
		guards: never;
		services: never;
	};
	eventsCausingActions: {
		"assignAnchor": "CONNECT_WITH_ANCHOR";
		"assignAuthSession": "RECOVER_II_SUCCESS" | "done.invoke.createTentativeDevice" | "done.invoke.getIIAuthSessionService";
		"assignFrontendDelegation": "ASSIGN_FRONTEND_DELEGATION";
		"assignLoading": "done.invoke.checkTentativeDevice";
		"assignRegistrationStatus": "done.invoke.checkRegistrationStatus";
		"assignUserIdentity": "ASSIGN_USER_DEVICE";
		"assignVerificationCode": "CONNECT_RETRY";
		"handleError": "error.platform.getIIAuthSessionService";
	};
	eventsCausingDelays: {

	};
	eventsCausingGuards: {

	};
	eventsCausingServices: {
		"checkRegistrationStatus": "done.invoke.getIIAuthSessionService";
		"checkTentativeDevice": "CONNECT_RETRY";
		"createTentativeDevice": "done.invoke.checkTentativeDevice";
		"getIIAuthSessionService": "CREATE_NEW_ANCHOR" | "EXISTING_NFID";
	};
	matchesStates: "CheckRegistrationStatus" | "End" | "IIConnectAnchor" | "IIConnectAnchorCode" | "IIConnectAnchorCodeLoading" | "IICreateNewNFID" | "IIRecoveryPhrase" | "IIThirdParty" | "InitAuthWithII";
	tags: never;
}
