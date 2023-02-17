
// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	internalEvents: {
		"done.invoke.ConnectAccountService": { type: "done.invoke.ConnectAccountService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.SendTransactionService": { type: "done.invoke.SendTransactionService"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"done.invoke.authenticate": { type: "done.invoke.authenticate"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
		"error.platform.ConnectAccountService": { type: "error.platform.ConnectAccountService"; data: unknown };
		"error.platform.SendTransactionService": { type: "error.platform.SendTransactionService"; data: unknown };
		"error.platform.authenticate": { type: "error.platform.authenticate"; data: unknown };
		"xstate.init": { type: "xstate.init" };
		"xstate.stop": { type: "xstate.stop" };
	};
	invokeSrcNameMap: {
		"AuthenticationMachine": "done.invoke.authenticate";
		"ConnectAccountService": "done.invoke.ConnectAccountService";
		"SendTransactionService": "done.invoke.SendTransactionService";
	};
	missingImplementations: {
		actions: never;
		delays: never;
		guards: never;
		services: never;
	};
	eventsCausingActions: {
		"assingError": "error.platform.SendTransactionService";
		"nfid_authenticated": "done.invoke.authenticate" | "xstate.stop";
		"sendRPCResponse": "done.invoke.ConnectAccountService" | "done.invoke.SendTransactionService" | "error.platform.SendTransactionService" | "xstate.stop";
	};
	eventsCausingDelays: {

	};
	eventsCausingGuards: {

	};
	eventsCausingServices: {
		"AuthenticationMachine": "xstate.init";
		"ConnectAccountService": "CONNECT_ACCOUNT";
		"SendTransactionService": "SEND_TRANSACTION";
	};
	matchesStates: "AuthenticationMachine" | "ConnectAccount" | "Error" | "Ready" | "SendTransaction";
	tags: never;
}
