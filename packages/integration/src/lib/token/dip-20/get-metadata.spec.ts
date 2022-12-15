import { Principal } from "@dfinity/principal"

import { getMetadata } from "./get-metadata"

describe("getMetadata", () => {
  it("should return correct data", async () => {
    const canisterId = "utozz-siaaa-aaaam-qaaxq-cai"
    const response = await getMetadata(canisterId)

    expect(response).toEqual({
      canisterId,
      decimals: 8,
      fee: expect.any(BigInt),
      logo: expect.any(String),
      name: "WICP",
      owner: expect.any(Principal),
      symbol: "WICP",
      totalSupply: expect.any(BigInt),
    })
  })
})
