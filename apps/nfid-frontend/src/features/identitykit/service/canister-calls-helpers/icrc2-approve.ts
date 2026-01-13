import { Agent, AnonymousIdentity, HttpAgent } from "@dfinity/agent"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"

import { idlFactory as icrc1and2IDL } from "../../idl/token-pepe-ledger"
import { _SERVICE as icrc1and2IDLService } from "../../idl/token-pepe-ledger_idl"
import { RPCMessage } from "../../type"
import { actorService } from "../actor.service"
import { IC_HOSTNAME } from "../method/interactive/icrc49-call-canister-method.service"

import { ICRC2Metadata } from "./interfaces"

export const getMetadataICRC2Approve = async (
  message: MessageEvent<RPCMessage>,
  args: any,
): Promise<ICRC2Metadata> => {
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

  const [parsedArgs] = JSON.parse(args)

  return {
    symbol,
    decimals,
    fee: fee.toString(),
    amount: parsedArgs?.amount,
    balance: balance.toString(),
    address: message.data.params.sender,
  }
}
