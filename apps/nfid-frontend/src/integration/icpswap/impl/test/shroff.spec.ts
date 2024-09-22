import {ShroffBuilder} from "src/integration/icpswap/impl/shroff-impl"
import {Icrc1Pair} from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair";
import {JsonnableEd25519KeyIdentity} from "@dfinity/identity/lib/cjs/identity/ed25519";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {SwapStage} from "src/integration/icpswap/types/enums";

const mock: JsonnableEd25519KeyIdentity = [
  '302a300506032b6570032100c88f8f46ee5c23a748026498ddc7ed2104782ea02cd266170a470587d7c2f932',
  '0b897d4ee58ff13eed9cc5f1aa6de0f009423b9a866b384b2e52db08559c882b'
]

const mockPrincipal = "4pw67-jou3d-xb4py-6pnvx-5p75x-pp3mi-ywe4j-bhmmq-l3354-awsws-kae"


describe("shroff test", () => {
  jest.setTimeout(900000)

  it("shroff quote test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "mxzaz-hqaaa-aaaar-qaada-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    const quote = await shroff.getQuote(0.5)
    expect(quote.getSourceAmountPrettified()).toEqual("0.5")
  })

//too long test. Unskip when needed
  it.skip("shroff transfer test", async function () {
    const sourceLedger = "ryjl3-tyaaa-aaaaa-aaaba-cai"
    const targetLedger = "zfcdd-tqaaa-aaaaq-aaaga-cai"
    const shroff = await new ShroffBuilder()
      .withSource(sourceLedger)
      .withTarget(targetLedger)
      .build()
    let ledgerICP = new Icrc1Pair(sourceLedger, undefined)
    let seconds = 0
    const balance = await ledgerICP.getBalance(mockPrincipal)
    console.log(balance)
    await shroff.getQuote(0.001)
    let mockId = Ed25519KeyIdentity.fromParsedJson(mock)
    shroff.swap(mockId)
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Transfer)
    while (shroff.getSwapTransaction()?.getStage() === SwapStage.Transfer && seconds < 10) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Deposit)

    while (shroff.getSwapTransaction()?.getStage() === SwapStage.Deposit && seconds < 30) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Swap)

    while (shroff.getSwapTransaction()?.getStage() === SwapStage.Swap && seconds < 50) {
      await sleep(1)
      seconds++
    }
    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Withdraw)

    while (shroff.getSwapTransaction()?.getStage() === SwapStage.Withdraw && seconds < 70) {
      await sleep(1)
      seconds++
    }

    expect(shroff.getSwapTransaction()?.getStage()).toEqual(SwapStage.Completed)
  })
})

const sleep = async (seconds: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
