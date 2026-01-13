import { toHex } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"

import { exchangeRateService, getBalance } from "@nfid/integration"
import { ICP_DECIMALS, WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { RPCMessage } from "../../type"

import { TransferMetadata } from "./interfaces"

export const getLedgerTransferMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<TransferMetadata> => {
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
  const amount = BigInt(requestParams.amount.e8s)
  const total = amount + BigInt(WALLET_FEE_E8S)
  const isInsufficientBalance = total > balance

  return {
    balance: balance.toString(),
    toAddress,
    amount: amount.toString(),
    isInsufficientBalance,
    usdRate: usdRate.toString(),
    address: message.data.params.sender,
    decimals: ICP_DECIMALS,
    symbol: "ICP",
    fee: WALLET_FEE_E8S.toString(),
    total: total.toString(),
  }
}
