import { TransactionRequest } from "@ethersproject/abstract-provider"

import {
  DelegationWalletAdapter,
  ProviderError,
  loadProfileFromLocalStorage,
} from "@nfid/integration"
import { RPCMessage } from "@nfid/integration-ethereum"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export async function populateTransactionData(
  rpcMessage: RPCMessage,
): Promise<[TransactionRequest, ProviderError | undefined]> {
  const adapter = new DelegationWalletAdapter(
    "https://eth-goerli.g.alchemy.com/v2/***REMOVED***",
  )
  const data = removeEmptyKeys(rpcMessage?.params[0])
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )
  return adapter.populateTransaction(data, delegation)
}

function removeEmptyKeys(data: { [key: string]: unknown }) {
  return Object.keys(data).reduce(
    (acc, key) => ({
      ...acc,
      ...(data[key] ? { [key]: data[key] } : {}),
    }),
    {},
  )
}
