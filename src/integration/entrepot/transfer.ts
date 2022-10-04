import { Identity } from "@dfinity/agent/lib/cjs/auth"
import { Principal } from "@dfinity/principal"
import { decodeTokenIdentifier } from "ictool"

import {
  Balance,
  TransferRequest,
  TransferResult,
} from "frontend/integration/_ic_api/ext.did"
import { extIDL } from "frontend/integration/_ic_api/ext_idl"
import { initActor } from "frontend/integration/actors"
import { isHex } from "frontend/ui/utils"

export async function transferNFT(
  token: string,
  source: Identity,
  target: string,
): Promise<Balance> {
  let actor = await initActor(
    source,
    decodeTokenIdentifier(token).canister,
    extIDL,
  )
  let request: TransferRequest = {
    token: token,
    from: constructUser(source.getPrincipal().toText()),
    subaccount: [],
    to: constructUser(target),
    amount: 1,
    memo: [],
    notify: false,
  }
  const result: TransferResult = (await actor.transfer(request).catch((e) => {
    throw Error(`Transfer failed!: ${e}`, e)
  })) as TransferResult

  if ("err" in result) throw Error(Object.keys(result.err)[0])
  return result.ok
}

const constructUser = (u: string) => {
  if (isHex(u) && u.length === 64) {
    return { address: u }
  } else {
    return { principal: Principal.fromText(u) }
  }
}
