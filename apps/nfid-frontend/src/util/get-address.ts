import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { hexStringToUint8Array } from "@dfinity/utils"

export function getAddress(principal: Principal, subAccountHex: string) {
  const subAccount = SubAccount.fromBytes(hexStringToUint8Array(subAccountHex))

  if (subAccount instanceof Error) {
    throw subAccount
  }

  const accountIdentifier = AccountIdentifier.fromPrincipal({ principal, subAccount })
  return accountIdentifier.toHex()
}
