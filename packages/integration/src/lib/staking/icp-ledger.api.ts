import type { Agent, Identity } from "@icp-sdk/core/agent"
import { IcpLedgerCanister } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@nfid-frontend/utils"

import { logWithTimestamp } from "./util/dev.utils"

export const ledgerCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity
  canisterId: Principal
}): Promise<{
  canister: IcpLedgerCanister
  agent: Agent
}> => {
  logWithTimestamp(`LC call...`)
  const agent = await createAgent({
    identity,
    host: IC_HOST,
  })

  const canister = IcpLedgerCanister.create({
    agent,
    canisterId,
  })

  logWithTimestamp(`LC complete.`)

  return {
    canister,
    agent,
  }
}
