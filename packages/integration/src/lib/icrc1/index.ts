import {
  Actor,
  ActorSubclass,
  Agent,
  HttpAgent,
  Identity,
} from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { idlFactory } from "../_ic_api/icrc1"
import { TransferArg } from "../_ic_api/icrc1.d"
import { iCRC1 } from "../actors"

export interface ICRC1Data {
  balance: bigint
  name: string
  symbol: string
  decimals: number
  fee: number
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
      const agent: Agent = await new HttpAgent({ host: "https://ic0.app" })
      const actor: ActorSubclass = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      })
      const balance = (await actor["icrc1_balance_of"]({
        subaccount: [],
        owner: Principal.fromText(globalAccountPublicKey),
      })) as bigint
      const name = (await actor["icrc1_name"]()) as string
      const symbol = (await actor["icrc1_symbol"]()) as string
      const decimals = (await actor["icrc1_decimals"]()) as number
      const fee = (await actor["icrc1_fee"]()) as number
      return { balance, name, symbol, decimals, fee, canisterId }
    }),
  )
}

export async function transferICRC1(
  globalAccountPrincipal: Identity,
  iCRC1Canister: string,
  args: TransferArg,
): Promise<number> {
  const agent: Agent = await new HttpAgent({
    host: "https://ic0.app",
    identity: globalAccountPrincipal,
  })
  const actor: ActorSubclass = Actor.createActor(idlFactory, {
    agent,
    canisterId: iCRC1Canister,
  })
  return (await actor["icrc1_transfer"](args)) as number
}

export async function getICRC1Canisters(
  principal: string,
): Promise<Array<string>> {
  return iCRC1.get_canisters_by_root(principal)
}

export async function addICRC1Canister(canisterId: string): Promise<void> {
  await iCRC1.store_icrc1_canister(canisterId)
}
