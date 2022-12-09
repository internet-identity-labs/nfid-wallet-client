import { Principal } from "@dfinity/principal"

import { getMetadata } from "./get-metadata"

describe("getMetadata", () => {
  it("should return correct data", async () => {
    const response = await getMetadata("utozz-siaaa-aaaam-qaaxq-cai")

    expect(response).toEqual({
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
