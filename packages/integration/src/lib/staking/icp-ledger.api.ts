import {logWithTimestamp} from "./util/dev.utils";
import type {Agent, Identity} from "@dfinity/agent";
import {LedgerCanister} from "@dfinity/ledger-icp";
import {Principal} from "@dfinity/principal";
import {createAgent} from "@dfinity/utils";


export const ledgerCanister = async ({
  identity,
canisterId
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<{
  canister: LedgerCanister;
  agent: Agent;
}> => {
  logWithTimestamp(`LC call...`);
  const agent = await createAgent({
    identity,
    host: IC_HOST,
  });

  const canister = LedgerCanister.create({
    agent,
    canisterId,
  });

  logWithTimestamp(`LC complete.`);

  return {
    canister,
    agent,
  };
};
