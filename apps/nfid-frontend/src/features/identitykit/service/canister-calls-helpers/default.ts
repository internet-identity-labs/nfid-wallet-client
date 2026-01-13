import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"

import { getBalance } from "@nfid/integration"

import { RPCMessage } from "../../type"

import { DefaultMetadata } from "./interfaces"

export const getDefaultMetadata = async (
  message: MessageEvent<RPCMessage>,
): Promise<DefaultMetadata> => {
  const account = decodeIcrcAccount(message.data.params.sender)

  const userAddress = AccountIdentifier.fromPrincipal({
    principal: account.owner as any,
    subAccount: account.subaccount as any,
  }).toHex()

  const balance = await getBalance(userAddress)

  return {
    balance: Number(balance),
    address: message.data.params.sender,
  }
}
