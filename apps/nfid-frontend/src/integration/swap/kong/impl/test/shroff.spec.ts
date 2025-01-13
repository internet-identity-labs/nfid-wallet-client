import {JsonnableEd25519KeyIdentity} from "@dfinity/identity/lib/cjs/identity/ed25519";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {Icrc1Pair} from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair";
import {KongShroffBuilder} from "src/integration/swap/kong/impl/kong-swap-shroff";

const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]


describe("Shroff Kong test" , () => {
  jest.setTimeout(1500000)

  it('should swap 2 tokens', async () => {

    let identity = Ed25519KeyIdentity.fromParsedJson(mock)
    let kongShroff = await new KongShroffBuilder()
      .withSource("ryjl3-tyaaa-aaaaa-aaaba-cai")
      .withTarget("o7oak-iyaaa-aaaaq-aadzq-cai")
      .build()

    // let resp: SwapAmountsResult = await actor.swap_amounts("ICP", BigInt(100000), "KONG")

    const quote = await kongShroff.getQuote("0.001")


    let ledgerICRC = new Icrc1Pair("ryjl3-tyaaa-aaaaa-aaaba-cai", undefined)
    let blncBefore = await ledgerICRC.getBalance(identity.getPrincipal().toText())
    let kongICRC = new Icrc1Pair("o7oak-iyaaa-aaaaq-aadzq-cai", undefined)
    let balanceKong = await kongICRC.getBalance(identity.getPrincipal().toText())


    let resp2 = await kongShroff.swap(identity)

    let balance = await ledgerICRC.getBalance(identity.getPrincipal().toText())
    console.log("difference ICP", blncBefore - balance)
    const updatedBalanceKong = await kongICRC.getBalance(identity.getPrincipal().toText())
    console.log("difference KONG", updatedBalanceKong - balanceKong)

  });

});
