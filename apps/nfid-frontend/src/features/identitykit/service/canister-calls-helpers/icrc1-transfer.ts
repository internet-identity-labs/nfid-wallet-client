import { Agent, AnonymousIdentity, HttpAgent } from "@dfinity/agent"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"

import { exchangeRateService } from "@nfid/integration"

import { idlFactory as icrc1and2IDL } from "../../idl/token-pepe-ledger"
import { _SERVICE as icrc1and2IDLService } from "../../idl/token-pepe-ledger_idl"
import { RPCMessage } from "../../type"
import { actorService } from "../actor.service"
import { IC_HOSTNAME } from "../method/interactive/icrc49-call-canister-method.service"

import { TransferMetadata } from "./interfaces"

export const getIcrc1TransferMetadata = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<TransferMetadata> => {
  const delegation = new AnonymousIdentity()

  const agent: Agent = new HttpAgent({
    host: IC_HOSTNAME,
    identity: delegation,
  })

  const actor = actorService.getActor<icrc1and2IDLService>(
    message.data.params.canisterId,
    icrc1and2IDL,
    agent,
  )

  const { owner, subaccount } = decodeIcrcAccount(message.data.params.sender)

  const [balance, symbol, decimals, fee] = await Promise.all([
    actor.icrc1_balance_of({
      owner,
      subaccount: subaccount ? [subaccount] : [],
    }),
    actor.icrc1_symbol(),
    actor.icrc1_decimals(),
    actor.icrc1_fee(),
  ])

  const [requestParams] = JSON.parse(args)

  const amount = BigInt(requestParams.amount)
  const total = amount + fee
  const isInsufficientBalance = total > balance

  const usdRate = await exchangeRateService.usdPriceForICRC1(
    message.data.params.canisterId,
  )

  return {
    balance: balance.toString(),
    toAddress: requestParams.to.owner["__principal__"],
    amount: amount.toString(),
    isInsufficientBalance,
    address: message.data.params.sender,
    symbol,
    decimals,
    fee: fee.toString(),
    usdRate: usdRate?.value.toString(),
    total: total.toString(),
  }
}
