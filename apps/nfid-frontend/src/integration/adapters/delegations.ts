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

export const getWalletDelegationAdapter =
  async (): Promise<DelegationIdentity> => {
    const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
    if (profile.wallet === RootWallet.II)
      return await getWalletDelegation(profile.anchor, "nfid.one", "0")
    else
      return await getGlobalKeys(
        authState.get().delegationIdentity!,
        Chain.IC,
        accessList,
      )
  }
