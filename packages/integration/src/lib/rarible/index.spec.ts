/**
 * @jest-environment jsdom
 */
import { Blockchain } from "@rarible/api-client"
import { convertEthereumToUnionAddress } from "@rarible/sdk/build/sdk-blockchains/ethereum/common"
import { toCurrencyId } from "@rarible/types/build/currency-id"

import { RaribleBridge } from "./index"

describe("Rarible suite", () => {
  jest.setTimeout(200000)
  it("Init Rarible and get balance", async () => {
    const raribleBridge = new RaribleBridge(
      "https://ethereum-goerli-rpc.allthatnode.com",
    )
    const address = convertEthereumToUnionAddress(
      await raribleBridge.ethersWallet().getAddress(),
      Blockchain.ETHEREUM,
    )
    try {
      await raribleBridge
        .sdk()
        .balances.getBalance(
          address,
          toCurrencyId("ETHEREUM:0x0000000000000000000000000000000000000000"),
        )
    } catch (e) {
      fail(e)
    }
  })
})
