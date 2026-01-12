/**
 * @jest-environment jsdom
 */
import {
  expectedAttributesResponse,
  mockAttributesResponse,
} from "src/integration/nft/impl/ext/properties/mock"
import { extPropertiesService } from "src/integration/nft/impl/ext/properties/properties-service"

describe("nft test suite", () => {
  it("should return nft properties", async function () {
    jest
      .spyOn(extPropertiesService as any, "fetchCollectionData")
      .mockResolvedValue(mockAttributesResponse)
    const actual = await extPropertiesService.getProperties(
      "o6lzt-kiaaa-aaaag-qbdza-cai",
      4234,
    )
    expect(actual).toEqual(expectedAttributesResponse)
  })
})
