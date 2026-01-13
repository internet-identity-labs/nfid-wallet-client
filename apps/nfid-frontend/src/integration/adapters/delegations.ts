import { DelegationIdentity } from "@dfinity/identity"

import { getGlobalDelegation } from "@nfid/integration"
import { RootWallet, accessList, authState } from "@nfid/integration"

import { getWalletDelegation } from "../facade/wallet"
import { fetchProfile } from "../identity-manager"

export const getWalletDelegationAdapter = async (
  domain = "nfid.one",
  accountId = "0",
  targetCanisters: string[] = [],
): Promise<DelegationIdentity> => {
  const profile = await fetchProfile()
  //deprecated old flow
  if (accountId !== "-1" && profile.wallet === RootWallet.II)
    return await getWalletDelegation(profile.anchor, domain, accountId)
  else
    return await getGlobalDelegation(
      authState.get().delegationIdentity!,
      accessList.concat(targetCanisters),
    )
}
