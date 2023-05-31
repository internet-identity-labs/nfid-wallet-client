
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "assignAmount": "ASSIGN_AMOUNT";
"assignDirection": "CHANGE_DIRECTION";
"assignError": "ASSIGN_ERROR";
"assignReceiverWallet": "ASSIGN_RECEIVER_WALLET";
"assignSelectedFT": "ASSIGN_SELECTED_FT";
"assignSelectedNFT": "ASSIGN_SELECTED_NFT";
"assignSourceAccount": "ASSIGN_SOURCE_ACCOUNT";
"assignSourceWallet": "ASSIGN_SOURCE_WALLET";
"assignTokenStandard": "ASSIGN_TOKEN_STANDARD";
"assignTokenType": "CHANGE_TOKEN_TYPE";
"assignTransferObject": "ON_TRANSFER_PROMISE";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "isSendFungible": "";
"isSendMachine": "";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "Hidden" | "ReceiveMachine" | "SendMachine" | "SendMachine.CheckSendType" | "SendMachine.SendFT" | "SendMachine.SendNFT" | "Success" | "TransferModal" | { "SendMachine"?: "CheckSendType" | "SendFT" | "SendNFT"; };
        tags: never;
      }
  