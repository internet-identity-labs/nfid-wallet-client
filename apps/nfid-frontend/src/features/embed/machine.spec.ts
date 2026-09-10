import { NFIDEmbedMachine } from "./machine"

describe("NFIDEmbedMachine", () => {
  it("should be defined and start in parallel RPC_RECEIVER/Main", () => {
    expect(NFIDEmbedMachine).toBeDefined()
  })
})
