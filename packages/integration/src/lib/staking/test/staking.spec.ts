import {Ed25519KeyIdentity} from "@dfinity/identity";
import {JsonnableEd25519KeyIdentity} from "@dfinity/identity/lib/cjs/identity/ed25519";
import {Principal} from "@dfinity/principal";
import {disburse, querySnsNeurons, stakeNeuron} from "../sns-governance.api";

const pairPrincipal = "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae";

const identityJSON : JsonnableEd25519KeyIdentity =[
  '302a300506032b6570032100131aeb46319e402bb2930889ab86caf1175efe71e9f313a4c5f91bb91153f63e',
  '2803f8e8547e0ed4deced3c645c9758fc72b6e61f60aa7b46f7705925b8a28fe'
]

const identityJSONPublic : JsonnableEd25519KeyIdentity =[
  '302a300506032b6570032100131aeb46319e402bb2930889ab86caf1175efe71e9f313a4c5f91bb91153f63e',
  '0'
]

let neuronId : any
//TODO temp tests. Will be moved to the FE folder
describe("Staking", () => {
  jest.setTimeout(60000);
  it('should return neuron', async () => {
     let edId = Ed25519KeyIdentity.fromParsedJson(identityJSONPublic)

  let neurons = await querySnsNeurons({
    identity: edId.getPrincipal(),
    rootCanisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
    certified: false,
  });
     neuronId = neurons[0].id[0]
    expect(neurons.length).toBeGreaterThan(0)
  });

  it('should stake neuron', async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    try {
      await disburse({
        identity: edId,
        rootCanisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
        neuronId: neuronId

      } )
    } catch (e: any) {
      console.log(e.message)
    }

    try {
      let id = await  stakeNeuron({
        stake: BigInt(500000000),
        identity: edId,
        canisterId: Principal.fromText("m2blf-zqaaa-aaaaq-aaejq-cai"),
      })
      console.log("STAKED")
      expect(id).toBeDefined()
    } catch (e : any) {
      console.log(e.message)
    }
  });
});
