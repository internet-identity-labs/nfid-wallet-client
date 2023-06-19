/**
 * @jest-environment jsdom
 */
import { HttpAgent } from "@dfinity/agent"
import { expect } from "@jest/globals"
import { Block } from "comment-parser"

import {
  createActorDynamically,
  evaluateMethod,
  getCommentsByMethodNames,
  getCandidFile,
  transformDidToJs,
} from "frontend/integration/candid/index"

const canisterId = "74gpt-tiaaa-aaaak-aacaa-cai"

describe.skip("candid runner suite", () => {
  jest.setTimeout(20000)
  it("retrieve candid file and execute method", async function () {
    let agent = new HttpAgent({ host: "https://ic0.app" })
    let calledMethodName = "read_applications"
    let result = await getCandidFile(canisterId, agent)
    let commentsByMethodNames: Map<string, Block> =
      getCommentsByMethodNames(result)
    let comment: Block | undefined = commentsByMethodNames.get(calledMethodName)
    expect(comment?.description).toContain(
      "Retrieve list of registered applications",
    )
    expect(comment?.tags.length).toBe(1)
    expect(comment?.tags[0].tag).toBe("return")
    expect(comment?.tags[0].name).toBe("HTTPApplicationResponse")
    expect(result).toContain(calledMethodName)
    let js = await transformDidToJs(result, agent)
    let actor = await createActorDynamically(js, canisterId)
    let evalResult = await evaluateMethod(actor, calledMethodName)
    expect((evalResult as any).status_code).toEqual(200)
  })

  it("should parse did file with multiline comment into an object", async function () {
    const did: string = `
    service : () -> {
      /**
     * Function to retrieve transaction history of the token. Returns array
     * of transactions and isLastPage boolean
     * @param canisterId
     * @param tokenId
     * @param from
     * @param to
     */
      read_applications: () -> (HTTPApplicationResponse) query;
    }
    `
    let commentsByMethodNames: Map<string, Block> =
      getCommentsByMethodNames(did)
    let comment: Block | undefined =
      commentsByMethodNames.get("read_applications")
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
  })

  it("should parse did file with two multiline comments and throw error", async function () {
    const did: string = `
    service : () -> {
      /**
     * Function to retrieve transaction history of the token. Returns array
     * of transactions and isLastPage boolean
     * @param canisterId
     * @param tokenId
     * @param from
     * @param to
     */
      /**
     * Function to retrieve transaction history of the token. Returns array
     * of transactions and isLastPage boolean
     * @param canisterId
     * @param tokenId
     * @param from
     * @param to
     */
      read_applications: () -> (HTTPApplicationResponse) query;
    }
    `
    try {
      getCommentsByMethodNames(did)
    } catch (e) {
      let error = e as Error
      expect(error.message).toBe("More than one multiline comments were found.")
    }
  })

  it("retrieve candid file and execute method with params", async function () {
    let agent = new HttpAgent({ host: "https://ic0.app" })
    let calledMethodName = "create_account"
    let result: string = await getCandidFile(canisterId, agent)
    expect(result).toContain(calledMethodName)
    let js = await transformDidToJs(result, agent)
    let actor = await createActorDynamically(js, canisterId)
    let param1 = { anchor: 10000 }
    let evalResult = await evaluateMethod(actor, calledMethodName, param1)
    expect((evalResult as any).status_code).toEqual(404)
    await expect(
      evaluateMethod(actor, calledMethodName, param1, param1),
    ).rejects.toThrow("Invalid argument entry 1")
  })
})
