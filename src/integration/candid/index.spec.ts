/**
 * @jest-environment jsdom
 */
import { HttpAgent } from "@dfinity/agent"

import {
  createActorDynamically,
  evaluateMethod,
  getCandidMetadata,
  transformDidToJs,
} from "frontend/integration/candid/index"

describe("candid runner suite", () => {
  it("retrieve candid file and execute method", async function () {
    let canisterId = "jiept-kaaaa-aaaao-aajsa-cai"
    let agent = new HttpAgent({ host: "https://ic0.app" })
    let calledMethodName = "read_applications"
    let result = await getCandidMetadata(canisterId, agent)
    expect(result).toContain(calledMethodName)
    let js = await transformDidToJs(result, agent)
    let actor = await createActorDynamically(js, "74gpt-tiaaa-aaaak-aacaa-cai") //todo update dfx version to get candid interface
    let evalResult = await evaluateMethod(actor, calledMethodName)
    expect(evalResult.status_code).toEqual(200)
  })
})
