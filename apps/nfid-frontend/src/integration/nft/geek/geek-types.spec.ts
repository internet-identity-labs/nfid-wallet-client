/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"

import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import {
  expectedGeekResponse,
  mockGeekResponse,
} from "src/integration/nft/mock/mock"

describe("geek api test", () => {
  it("should fetch and map NFT data correctly", async () => {
    jest
      .spyOn(nftGeekService as any, "fetchNftGeekData")
      .mockResolvedValue(mockGeekResponse)
    const result = await nftGeekService.getNftGeekData(
      Principal.fromText(
        "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
      ),
    )
    expect(result).toEqual(expectedGeekResponse)
  })
})
