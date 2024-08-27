import { toHex } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"

import { exchangeRateService, getBalance } from "@nfid/integration"
import { WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { RPCMessage } from "../../type"

export interface LedgerTransferMetadata {
  toAddress: string
  amount: number
  balance: number
  isInsufficientBalance: boolean
  usdRate?: number
  address: string
}

export const getLedgerTransferMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<LedgerTransferMetadata> => {
  const [requestParams] = JSON.parse(args)
  const toArray = Object.values(requestParams.to) as any as ArrayBuffer

  const usdRate = exchangeRateService.getICP2USD()
  const account = decodeIcrcAccount(message.data.params.sender)

  const userAddress = AccountIdentifier.fromPrincipal({
    principal: account.owner as any,
    subAccount: account.subaccount as any,
  }).toHex()

  const balance = await getBalance(userAddress)

  const toAddress = toHex(toArray)
  const amount = Number(requestParams.amount.e8s)
  const isInsufficientBalance = amount + WALLET_FEE_E8S > Number(balance)

  return {
    balance: Number(balance),
    toAddress,
    amount,
    isInsufficientBalance,
    usdRate: usdRate.toNumber(),
    address: message.data.params.sender,
  }
}
