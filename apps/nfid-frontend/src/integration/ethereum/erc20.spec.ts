import { parseEther } from "ethers"
import { erc20Service } from "./erc20.service"
import { Ed25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { mockIdentityA } from "@nfid/integration"

describe("ERC20Service", () => {
  const ADDRESS = "0x20d8e0104C9d3EB43714aB5AA4A06bbc04d93496"
  jest.setTimeout(100000)
  describe("erc20", () => {
    it.skip("should estimate ERC20 gas", async () => {
      const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      const amount = parseEther("1")
      // estimateGas requires 'from' address
      const gas = await erc20Service.estimateERC20Gas(
        contractAddress,
        ADDRESS,
        amount,
      )
      console.debug("gas", gas)
      expect(gas).toBeDefined()
    })

    it("should send ERC20 transaction", async () => {
      const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      const identity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      let balance = await erc20Service.getMultipleTokenBalances(ADDRESS, [
        contractAddress,
      ])
      console.debug("balance", balance)
      expect(balance).toBeDefined()
      const amount = parseEther("1")
      const gas = await erc20Service.estimateERC20Gas(
        contractAddress,
        ADDRESS,
        amount,
      )
      console.debug("gas", gas)
      const response = await erc20Service.sendErc20Transaction(
        identity,
        contractAddress,
        ADDRESS,
        amount.toString(),
        gas,
      )
      console.debug("response", response)
      expect(gas).toBeDefined()
    })
  })

  it("should get known tokens list", async () => {
    const tokens = await erc20Service.getKnownTokensList()
    console.debug("tokens", JSON.stringify(tokens, null, 2))
    expect(tokens).toBeDefined()
  })
})
