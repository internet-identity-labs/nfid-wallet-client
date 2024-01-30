import * as Agent from "@dfinity/agent"
import { HttpAgent, Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { idlFactory as icrc1IDL } from "../_ic_api/icrc1"
import {
  _SERVICE as ICRC1,
  Icrc1TransferResult,
  TransferArg,
} from "../_ic_api/icrc1.d"
import { agentBaseConfig, iCRC1Registry } from "../actors"

export interface ICRC1Data {
  balance: bigint
  name: string
  symbol: string
  decimals: number
  fee: bigint
  canisterId: string
}

/*
 * rootPrincipalId: the principal id of the account
 * globalAccountPublicKey: the public key returned by lambda
 */
export async function getICRC1Data(
  rootPrincipalId: string,
  globalAccountPublicKey: string,
): Promise<Array<ICRC1Data>> {
  const canisters = await getICRC1Canisters(rootPrincipalId)
  return Promise.all(
    canisters.map(async (canisterId) => {
      const actor = Agent.Actor.createActor<ICRC1>(icrc1IDL, {
        canisterId: canisterId,
        agent: new HttpAgent({ ...agentBaseConfig }),
      })
      const name = await actor.icrc1_name()
      const balance = await actor.icrc1_balance_of({
        subaccount: [],
        owner: Principal.fromText(globalAccountPublicKey),
      })
      const symbol = await actor.icrc1_symbol()
      const decimals = await actor.icrc1_decimals()
      const fee = await actor.icrc1_fee()
      return {
        balance,
        canisterId,
        decimals,
        fee,
        name,
        symbol,
      }
    }),
  )
}

export async function transferICRC1(
  globalAccountPrincipal: Identity,
  iCRC1Canister: string,
  args: TransferArg,
): Promise<Icrc1TransferResult> {
  const actor = Agent.Actor.createActor<ICRC1>(icrc1IDL, {
    canisterId: iCRC1Canister,
    agent: new HttpAgent({
      host: "https://ic0.app",
      identity: globalAccountPrincipal,
    }),
  })
  return await actor.icrc1_transfer(args)
}

export async function getICRC1Canisters(
  principal: string,
): Promise<Array<string>> {
  return iCRC1Registry.get_canisters_by_root(principal)
}

export async function addICRC1Canister(canisterId: string): Promise<void> {
  await iCRC1Registry.store_icrc1_canister(canisterId)
}
