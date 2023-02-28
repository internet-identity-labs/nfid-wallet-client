import { DelegationIdentity } from "@dfinity/identity"

import { processArray } from "@nfid-frontend/utils"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import {
  fetchAccounts,
  fetchProfile,
} from "frontend/integration/identity-manager"

import { getEthAddress } from "./get-eth-address"

export const getAllEthAddresses: () => Promise<string[]> = async () => {
  const profile = await fetchProfile()
  const accounts = await fetchAccounts()
  let addresses: string[] = []

  const delegations = await Promise.all(
    accounts.map(async (account) => {
      return await getWalletDelegation(
        profile.anchor,
        account.domain,
        account.accountId,
      )
    }),
  )

  const fetchAddress = async (
    element: DelegationIdentity,
    callback: () => void,
  ) => {
    const address = await getEthAddress(element)
    addresses.push(address)
    callback()
  }

  return new Promise((resolve) =>
    processArray(delegations, fetchAddress, () => {
      console.log({ addresses, delegations, accounts })
      resolve(addresses)
    }),
  )
}
