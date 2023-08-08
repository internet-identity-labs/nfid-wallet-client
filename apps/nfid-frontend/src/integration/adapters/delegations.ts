import { DelegationIdentity } from "@dfinity/identity"
import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"

import {
  RootWallet,
  accessList,
  authState,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { getWalletDelegation } from "../facade/wallet"
import { fetchProfile } from "../identity-manager"

export const getWalletDelegationAdapter = async (
  domain = "nfid.one",
  accountId = "0",
  targetCanisters: string[] = [],
): Promise<DelegationIdentity> => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  if (accountId !== "-1" && profile.wallet === RootWallet.II)
    return await getWalletDelegation(profile.anchor, domain, accountId)
  else
    return await getGlobalKeys(
      authState.get().delegationIdentity!,
      Chain.IC,
      accessList.concat(targetCanisters),
    )
}
