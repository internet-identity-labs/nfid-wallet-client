import { AccountIdentifier, SubAccount } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { hexStringToUint8Array } from "@nfid-frontend/utils"

export function getAddress(principal: Principal, subAccountHex: string) {
  const subAccount = SubAccount.fromBytes(hexStringToUint8Array(subAccountHex))

  if (subAccount instanceof Error) {
    throw subAccount
  }

  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal,
    subAccount,
  })
  return accountIdentifier.toHex()
}
