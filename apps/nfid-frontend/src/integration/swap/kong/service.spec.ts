import {JsonnableEd25519KeyIdentity} from "@dfinity/identity/lib/cjs/identity/ed25519";
import {actorBuilder, agentBaseConfig} from "@nfid/integration";
import {_SERVICE, SwapAmountsResult, SwapArgs} from "src/integration/swap/kong/idl/kong_backend.d";
import {idlFactory as KongIDL} from "src/integration/swap/kong/idl/kong_backend";
import {HttpAgent} from "@dfinity/agent";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {Icrc1Pair} from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair";

import { idlFactory as icrc1IDL } from "./idl/icrc1"
import { _SERVICE as ICRC1ServiceIDL , ApproveArgs, Account } from "./idl/icrc1.d"
import {Principal} from "@dfinity/principal";
const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]


describe("12333" , () => {
  jest.setTimeout(1500000)

  it('should333 ', async () => {

    let id = Ed25519KeyIdentity.fromParsedJson(mock)

    console.log(id.getPrincipal().toText())

    let actor = actorBuilder<_SERVICE>(
      "2ipq2-uqaaa-aaaar-qailq-cai",
      KongIDL,
      {
        agent: new HttpAgent({ ...agentBaseConfig, identity: id }),
      },
    )
    let pools = await actor.pools(["KONG_ICP"])

    console.log("pools", JSON.stringify(pools))

    let resp: SwapAmountsResult = await actor.swap_amounts("ICP", BigInt(100000), "KONG")

    console.log(JSON.stringify(resp))

    let args: SwapArgs = {
      receive_token: "KONG",
      max_slippage: [3],
      pay_amount: BigInt(100000),
      referred_by: [],
      // @ts-ignore
      receive_amount: [resp.Ok.receive_amount],
      receive_address: [],
      pay_token: "ICP",
      pay_tx_id: []
    }


    let ledgerICRC = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", undefined)

    let blncBefore = await ledgerICRC.getBalance(id.getPrincipal().toText())
    let kongICRC = new Icrc1Pair("o7oak-iyaaa-aaaaq-aadzq-cai", undefined)

    let balanceKong = await kongICRC.getBalance(id.getPrincipal().toText())

    const actorICRC2 = actorBuilder<ICRC1ServiceIDL>(
      "ryjl3-tyaaa-aaaaa-aaaba-cai",
      icrc1IDL,
      {
        agent: new HttpAgent({ ...agentBaseConfig, identity: id }),
      },
    )

    const acc : Account = {
      owner: Principal.fromText(
        "2ipq2-uqaaa-aaaar-qailq-cai"
      ),
      subaccount: [],
    }

    const icrc2_approve_args : ApproveArgs= {
      from_subaccount: [],
      spender: acc,
      fee: [],
      memo: [],
      amount: BigInt(110000),
      created_at_time: [],
      expected_allowance: [],
      expires_at: [{
        timestamp_nanos: BigInt(1739927395042000000)
      }],
    }

    const response = await actorICRC2.icrc2_approve(icrc2_approve_args)

    console.log("ICRC2",JSON.stringify(response))

    let resp2 = await actor.swap(args)
    console.log(JSON.stringify(resp2))


    let balance = await ledgerICRC.getBalance(id.getPrincipal().toText())

    console.log("difference ICP", blncBefore - balance)

    const updatedBalanceKong = await kongICRC.getBalance(id.getPrincipal().toText())

    console.log("difference KONG", updatedBalanceKong - balanceKong)

    //
    // // @ts-ignore
    // let txs = await actor.requests([BigInt(resp2.Ok)])
    // console.log(JSON.stringify(txs))

  });

});
