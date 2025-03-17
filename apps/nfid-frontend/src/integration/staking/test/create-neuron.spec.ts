import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { NeuronId } from "@dfinity/nns-proto"
import { Principal } from "@dfinity/principal"
import { ftService } from "src/integration/ft/ft-service"
import { stakingService } from "src/integration/staking/service/staking-service-impl"

import { disburse, querySnsNeurons } from "@nfid/integration"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

const pairPrincipal =
  "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae"

const identityJSON: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100131aeb46319e402bb2930889ab86caf1175efe71e9f313a4c5f91bb91153f63e",
  "2803f8e8547e0ed4deced3c645c9758fc72b6e61f60aa7b46f7705925b8a28fe",
]

const identityJSONPublic: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100131aeb46319e402bb2930889ab86caf1175efe71e9f313a4c5f91bb91153f63e",
  "0",
]

let neuronId: NeuronId
describe("Staking", () => {
  jest.setTimeout(60000)
  it.skip("should stake neuron", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce([
        {
          ledger: "mih44-vaaaa-aaaaq-aaekq-cai",
          name: "NFIDW",
          symbol: "NFIDW",
          logo: "Some NFIDW",
          index: "mgfru-oqaaa-aaaaq-aaelq-cai",
          state: "Active",
          category: "Sns",
          fee: BigInt(10000),
          decimals: 8,
          rootCanisterId: "m2blf-zqaaa-aaaaq-aaejq-cai",
        },
        {
          ledger: ICP_CANISTER_ID,
          name: "NFIDW",
          symbol: "NFIDW",
          logo: "Some NFIDW",
          index: "mgfru-oqaaa-aaaaq-aaelq-cai",
          state: "Sns",
          category: "Sns",
          fee: BigInt(10000),
          decimals: 8,
          rootCanisterId: "m2blf-zqaaa-aaaaq-aaejq-cai",
        },
      ])
    try {
      let neuronsNFIDW = await querySnsNeurons({
        identity: edId.getPrincipal(),
        rootCanisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
        certified: false,
      })
      console.log("NEURONS", neuronsNFIDW)
      await disburse({
        identity: edId,
        rootCanisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
        neuronId: neuronsNFIDW.find(
          (n) => n.cached_neuron_stake_e8s === BigInt(500000000),
        )!.id[0]!,
      })
    } catch (e: any) {
      console.log(e.message)
    }
    let token = await ftService
      .getTokens(pairPrincipal)
      .then((tokens) =>
        tokens.find((token) => token.getTokenSymbol() === "NFIDW"),
      )
    let neuron = await stakingService.stake(token!, "5", edId)
    expect(neuron).toBeDefined()
    expect(neuron.getStakeId()).toBeDefined()
    await neuron.redeem(edId)
    let neuronsNFIDW = await querySnsNeurons({
      identity: edId.getPrincipal(),
      rootCanisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
      certified: false,
    })
    let redeemedNeuron = neuronsNFIDW.find(
      (n) => n.cached_neuron_stake_e8s === BigInt(500000000),
    )
    expect(redeemedNeuron).toBeUndefined()
  })
})
