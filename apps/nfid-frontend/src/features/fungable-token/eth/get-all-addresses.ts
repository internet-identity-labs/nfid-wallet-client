import { processArray } from "@nfid-frontend/utils"
import { Account, extendWithFixedAccounts } from "@nfid/integration"

import {
  fetchAccounts,
  fetchApplications,
  fetchProfile,
} from "frontend/integration/identity-manager"

import { getEthAddress } from "./get-eth-address"

export const getAllEthAddresses: () => Promise<string[]> = async () => {
  const profile = await fetchProfile()
  const accounts = await fetchAccounts()
  const applications = await fetchApplications()

  const allAccounts = extendWithFixedAccounts(accounts, applications)
  let addresses: string[] = []

  const fetchAddress = async (element: Account, callback: () => void) => {
    const address = await getEthAddress({
      anchor: profile.anchor,
      hostname: element.domain,
      accountId: element.accountId,
    })
    addresses.push(address)
    callback()
  }

  return new Promise((resolve) =>
    processArray(allAccounts, fetchAddress, () => {
      console.log({ addresses, allAccounts })
      resolve(addresses)
    }),
  )
}
