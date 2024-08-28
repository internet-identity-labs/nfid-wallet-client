import { DelegationIdentity } from "@dfinity/identity"

import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"

export const getIdentity = async (
  domain = "nfid.one",
  accountId = "0",
  targetCanisters: string[],
): Promise<DelegationIdentity> => {
  return getWalletDelegationAdapter(domain, accountId, targetCanisters)
}
