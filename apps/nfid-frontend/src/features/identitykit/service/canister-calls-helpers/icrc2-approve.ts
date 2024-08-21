import { Agent, AnonymousIdentity, HttpAgent } from "@dfinity/agent"

import { idlFactory as icrc1and2IDL } from "../../idl/token-pepe-ledger"
import { RPCMessage } from "../../type"
import { actorService } from "../actor.service"
import { IC_HOSTNAME } from "../method/interactive/icrc49-call-canister-method.service"

export const getMetadataICRC2Approve = async (
  message: MessageEvent<RPCMessage>,
  args: any,
) => {
  const delegation = new AnonymousIdentity()

  const agent: Agent = new HttpAgent({
    host: IC_HOSTNAME,
    identity: delegation,
  })

  const actor = actorService.getActor<any>(
    message.data.params.canisterId,
    icrc1and2IDL,
    agent as never,
  )

  const [symbol, decimals, fee] = await Promise.all([
    actor.icrc1_symbol(),
    actor.icrc1_decimals(),
    actor.icrc1_fee(),
  ])

  const [parsedArgs] = JSON.parse(args)

  return {
    symbol,
    decimals,
    fee,
    amount: parsedArgs?.amount,
  }
}
