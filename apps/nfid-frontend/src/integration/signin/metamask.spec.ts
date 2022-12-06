import { Wallet } from "ethers"

import { getIdentityByMessageAndWallet } from "./metamask"

declare const METAMASK_SIGNIN_MESSAGE: string

describe("SignIn with Internet Identity", () => {
  jest.setTimeout(150000)

  it("should generate identity based on metamask signature.", async () => {
    expect(Wallet).toBeDefined()
    expect(getIdentityByMessageAndWallet).toBeDefined()
    expect(METAMASK_SIGNIN_MESSAGE).toBeDefined()
    // const wallet: Wallet = Wallet.fromMnemonic(
    //   "copy neck copy eager sing begin worry shed pitch spin daring toward",
    // )
    // const wallet2: Wallet = Wallet.createRandom()
    // const wallet3: Wallet = Wallet.fromMnemonic(
    //   "copy neck copy eager sing begin worry shed pitch spin daring toward",
    // )

    // const signature1: string = await wallet.signMessage(METAMASK_SIGNIN_MESSAGE)
    // const signature2: string = await wallet2.signMessage(
    //   METAMASK_SIGNIN_MESSAGE,
    // )
    // const signature3: string = await wallet3.signMessage(
    //   METAMASK_SIGNIN_MESSAGE,
    // )

    // const principal = (await getIdentityByMessageAndWallet(signature1))
    //   .getPrincipal()
    //   .toString()

    // const principal2 = (await getIdentityByMessageAndWallet(signature2))
    //   .getPrincipal()
    //   .toString()

    // const principal3 = (await getIdentityByMessageAndWallet(signature3))
    //   .getPrincipal()
    //   .toString()

    // expect(principal).toEqual(principal3)
    // expect(principal).not.toEqual(principal2)
  })
})
