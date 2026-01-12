import { Ed25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { mockIdentityA } from "@nfid/integration"
import { ethErc20Service } from "./eth/eth-erc20.service"
import { ETH_DECIMALS } from "@nfid/integration/token/constants"

describe.skip("ERC20Service", () => {
  const ADDRESS = "0x20d8e0104C9d3EB43714aB5AA4A06bbc04d93496"
  jest.setTimeout(100000)
  describe("erc20", () => {
    it.skip("should estimate ERC20 gas", async () => {
      const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      const amount = "1"
      // estimateGas requires 'from' address
      const gas = await ethErc20Service.estimateERC20Gas(
        contractAddress,
        ADDRESS,
        ADDRESS,
        amount,
        ETH_DECIMALS,
      )
      console.debug("gas", gas)
      expect(gas).toBeDefined()
    })

    it("should send ERC20 transaction", async () => {
      const contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      const identity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      const balance = await ethErc20Service.getMultipleTokenBalances(ADDRESS, [
        contractAddress,
      ])
      console.debug("balance", balance)
      expect(balance).toBeDefined()
      const amount = "1"
      const gas = await ethErc20Service.estimateERC20Gas(
        contractAddress,
        ADDRESS,
        ADDRESS,
        amount,
        ETH_DECIMALS,
      )
      console.debug("gas", gas)
      const response = await ethErc20Service.sendErc20Transaction(
        identity,
        contractAddress,
        ADDRESS,
        amount.toString(),
        ETH_DECIMALS,
        gas,
      )
      console.debug("response", response)
      expect(gas).toBeDefined()
    })
  })

  it("should get known tokens list", async () => {
    const tokens = await ethErc20Service.getTokensList()
    console.debug("tokens", JSON.stringify(tokens, null, 2))
    expect(tokens).toBeDefined()
  })
})
