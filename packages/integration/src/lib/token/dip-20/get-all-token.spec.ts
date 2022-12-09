import { TOKEN_CANISTER } from "./constants"
import { Metadata } from "./dip-20.d"
import { getAllToken } from "./get-all-token"

describe("getAllToken", () => {
  it("should return metadata for all static configured canister ids", async () => {
    const response: Metadata[] = await getAllToken()

    expect(response.length).toEqual(TOKEN_CANISTER.length)
  })
})
