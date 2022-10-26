/**
 * @jest-environment jsdom
 */
import { HttpAgent } from "@dfinity/agent"
import { Block } from "comment-parser"

import {
  createActorDynamically,
  evaluateMethod,
  getCandidMetadata,
  getCommentsByMethodNames,
  transformDidToJs,
} from "frontend/integration/candid/index"

describe("candid runner suite", () => {
  it("retrieve candid file and execute method", async function () {
    let canisterId = "jiept-kaaaa-aaaao-aajsa-cai"
    let agent = new HttpAgent({ host: "https://ic0.app" })
    let calledMethodName = "read_applications"
    let result = await getCandidMetadata(canisterId, agent)
    let commentsByMethodNames: Map<string, Block> =
      getCommentsByMethodNames(result)
    let comment: Block | undefined = commentsByMethodNames.get(calledMethodName)
    expect(comment?.description).toContain(
      "Function to retrieve transaction history of the token.",
    )
    expect(comment?.tags.length).toBe(4)
    expect(comment?.tags[0].tag).toBe("param")
    expect(comment?.tags[0].name).toBe("canisterId")
    expect(comment?.tags[1].tag).toBe("param")
    expect(comment?.tags[1].name).toBe("tokenId")
    expect(comment?.tags[2].tag).toBe("param")
    expect(comment?.tags[2].name).toBe("from")
    expect(comment?.tags[3].tag).toBe("param")
    expect(comment?.tags[3].name).toBe("to")
    expect(result).toContain(calledMethodName)
    let js = await transformDidToJs(result, agent)
    let actor = await createActorDynamically(js, "jiept-kaaaa-aaaao-aajsa-cai") //todo update dfx version to get candid interface
    let evalResult = await evaluateMethod(actor, calledMethodName)
    expect(evalResult.status_code).toEqual(200)
  })
})
