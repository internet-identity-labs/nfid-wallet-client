import { getBalance } from "./get-balance"

describe("getBalance", () => {
  it("should return the balance of the principal", async () => {
    const balance = await getBalance({
      canisterId: "utozz-siaaa-aaaam-qaaxq-cai",
      principalId:
        "dcxdv-zztqe-t22xz-k4jl6-j7vx5-3b3zh-z645u-mjlg6-lnerc-qaiq2-sae",
    })
    expect(balance).toEqual(BigInt(0))
  })
})
