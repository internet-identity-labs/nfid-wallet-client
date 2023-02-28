import { ethers } from "ethers"

import { createAddress, readAddress } from "@nfid/client-db"
import { replaceActorIdentity, ecdsaSigner, EthWallet } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { getEthProvider } from "./provider"

type GetAddressArgs = {
  anchor: number
  hostname: string
  accountId: string
}

export const getEthAddress = async ({
  anchor,
  hostname,
  accountId,
}: GetAddressArgs) => {
  const cachedAddress = readAddress({
    accountId: accountId,
    hostname: hostname,
  })

  if (cachedAddress) return cachedAddress

  const identity = await getWalletDelegation(anchor, hostname, accountId)
  replaceActorIdentity(ecdsaSigner, identity)

  const rpcProvider = new ethers.providers.JsonRpcProvider(getEthProvider())
  const nfidWallet = new EthWallet(rpcProvider)

  const address = await nfidWallet.getAddress()
  !cachedAddress && createAddress({ address, accountId, hostname })

  return address
}
