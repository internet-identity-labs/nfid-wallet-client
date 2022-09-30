import { Principal } from "@dfinity/principal"
import { getSubAccountArray } from "ictool/dist/principal"
import { decodeTokenIdentifier, principalToAddress } from "ictool"
import { isHex } from "frontend/ui/utils"
import { HttpAgent } from "@dfinity/agent"
import { _SERVICE as Ext, TransferRequest, TransferResult } from "frontend/integration/_ic_api/ext.did"
import { actor } from "frontend/integration/actors"
import { extIDL } from "frontend/integration/_ic_api/ext_idl"


// async function typeA() {
//   if (!validatePrincipal(to_user)) reject("This does not support traditional addresses, you must use a Principal");
//   _mapIdls.get("").transfer_to(Principal.fromText(to_user), tokenObj.index).then(b => {
//     if (b) {
//       // resolve(true);
//     } else {
//       // reject("Something went wrong");
//     }
//   }).catch(reject);
// }
//
// async function typeB() {
//   if (!validatePrincipal(to_user)) reject("This does not support traditional addresses, you must use a Principal");
//   api.transferFrom(Principal.fromText(from_principal), Principal.fromText(to_user), tokenObj.index).then(b => {
//     if (b.hasOwnProperty('ok')) {
//       resolve(true);
//     } else {
//       reject("Something went wrong");
//     }
//   }).catch(reject);
// }

async function transfer(from_principal: Principal, tid: string, to_user: string, amount: number, memo: string, notify: boolean, from_sa?: number) : Promise<TransferResult>{
  let tokenIdentifier = decodeTokenIdentifier(tid)
  let request: TransferRequest = {
    token: tid,
    from: { "address": principalToAddress(from_principal as any, from_sa ?? 0) },
    subaccount: [getSubAccountArray(from_sa ?? 0)],
    to: constructUser(to_user),
    amount: amount,
    memo: fromHexString(memo),
    notify: notify,
  }

  let api = actor<Ext>(tokenIdentifier.canister, extIDL, {
    agent: new HttpAgent({ identity, host: "https://ic0.app" }),
  })

 return  api.transfer(request)
}


const fromHexString = (hex: string) => {
  if (hex.substr(0, 2) === "0x") hex = hex.substr(2)
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16))
  return bytes
}

const constructUser = (u: string) => {
  if (isHex(u) && u.length === 64) {
    return { "address": u }
  } else {
    return { "principal": Principal.fromText(u) }
  }


}
//
// const validatePrincipal = (p) => {
//   try {
//     return (p === Principal.fromText(p).toText());
//   } catch (e) {
//     return false;
//   }
// }


