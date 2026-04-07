import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"

import { getBalance } from "@nfid/integration"

import { RPCMessage } from "../../type"
import { DefaultMetadata } from "./interfaces"

export const getDefaultMetadata = async (
  message: MessageEvent<RPCMessage>,
): Promise<DefaultMetadata> => {
  const account = decodeIcrcAccount(message.data.params.sender)

  const subAccountBytes = account.subaccount
    ? Uint8Array.from(account.subaccount as number[])
    : undefined
  const subAccount = subAccountBytes
    ? SubAccount.fromBytes(subAccountBytes)
    : undefined
  if (subAccount instanceof Error) throw subAccount

  const userAddress = AccountIdentifier.fromPrincipal({
    principal: account.owner as unknown as Principal,
    subAccount,
  }).toHex()

  const balance = await getBalance(userAddress)

  return {
    balance: Number(balance),
    address: message.data.params.sender,
  }
}
