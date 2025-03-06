import type { Agent, Identity } from "@dfinity/agent"
import { IcrcIndexCanister, IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import {
  SnsGovernanceCanister,
  SnsRootCanister,
  SnsSwapCanister,
  SnsWrapper,
} from "@dfinity/sns"
import { createAgent } from "@dfinity/utils"

type CanisterIds = {
  rootCanisterId: Principal
  governanceCanisterId: Principal
  ledgerCanisterId: Principal
  swapCanisterId: Principal
  indexCanisterId: Principal
}

const buildWrapper = ({
  agent,
  certified,
  canisterIds: {
    rootCanisterId,
    governanceCanisterId,
    ledgerCanisterId,
    swapCanisterId,
    indexCanisterId,
  },
}: {
  agent: Agent
  certified: boolean
  canisterIds: CanisterIds
}) => {
  return new SnsWrapper({
    root: SnsRootCanister.create({ canisterId: rootCanisterId, agent }),
    governance: SnsGovernanceCanister.create({
      canisterId: governanceCanisterId,
      agent,
    }),
    ledger: IcrcLedgerCanister.create({ canisterId: ledgerCanisterId, agent }),
    swap: SnsSwapCanister.create({ canisterId: swapCanisterId, agent }),
    index: IcrcIndexCanister.create({ canisterId: indexCanisterId, agent }),
    certified,
  })
}

export const loadSnsWrapper = async ({
  identity,
  certified,
  rootCanisterId,
}: {
  certified: boolean
  identity: Identity
  rootCanisterId: Principal
}): Promise<SnsWrapper> => {
  let root = SnsRootCanister.create({ canisterId: rootCanisterId })
  const canister_ids = await root.listSnsCanisters({ certified: false })
  const agent = await createAgent({
    identity,
    host: IC_HOST,
  })
  const swapCanisterId = canister_ids.swap[0]!
  const governanceCanisterId = canister_ids.governance[0]!
  const ledgerCanisterId = canister_ids.ledger[0]!
  const indexCanisterId = canister_ids.index[0]!
  return buildWrapper({
    agent,
    certified,
    canisterIds: {
      rootCanisterId,
      governanceCanisterId,
      ledgerCanisterId,
      swapCanisterId,
      indexCanisterId,
    },
  })
}
