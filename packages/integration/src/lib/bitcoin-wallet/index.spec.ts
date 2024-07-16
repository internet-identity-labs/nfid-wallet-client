/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { mockIdentityA } from "@nfid/integration"

import { btcWallet, replaceActorIdentity } from "../actors"
import { generateDelegationIdentity } from "../test-utils"
import { bcComputeFee } from "./blockcypher-adapter"
import { BtcWallet } from "./btc-wallet"

describe.skip("BTC suite", () => {
  jest.setTimeout(200000)

  let address = ""

  it("get btc address", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceActorIdentity(btcWallet, delegationIdentity)
    address = await new BtcWallet(delegationIdentity).getBitcoinAddress()
    expect(address).toEqual("mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc")
    const aa = await bcComputeFee(
      "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
      "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
      10,
    )
    console.log(aa)
  })
})
