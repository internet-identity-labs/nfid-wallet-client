import { toHex } from "@dfinity/agent"
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"

import { exchangeRateService, getBalance } from "@nfid/integration"
import { ICP_DECIMALS, WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { RPCMessage } from "../../type"
import { TransferMetadata } from "./interfaces"

type LedgerTransferArgs = Array<{
  to: Record<string, number>
  amount: { e8s: string | number | bigint }
}>

export const getLedgerTransferMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: string,
): Promise<TransferMetadata> => {
  const [requestParams] = JSON.parse(args) as LedgerTransferArgs
  const toBytes = Uint8Array.from(Object.values(requestParams.to))

  const usdRate = exchangeRateService.getICP2USD()
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

  const toAddress = toHex(toBytes)
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
