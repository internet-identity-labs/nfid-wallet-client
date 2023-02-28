import { DelegationIdentity } from "@dfinity/identity"
import { ethers } from "ethers"

import { replaceActorIdentity, ecdsaSigner, EthWallet } from "@nfid/integration"

import { getEthProvider } from "./provider"

export const getEthAddress = async (identity?: DelegationIdentity) => {
  if (!identity) return ""

  await replaceActorIdentity(ecdsaSigner, identity)

  const rpcProvider = new ethers.providers.JsonRpcProvider(getEthProvider())
  const nfidWallet = new EthWallet(rpcProvider)

  return await nfidWallet.getAddress()
}
