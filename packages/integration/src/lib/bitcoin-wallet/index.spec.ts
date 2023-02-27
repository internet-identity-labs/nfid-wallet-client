/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { BigNumber } from "@rarible/utils"

import {
  btcWallet,
  generateDelegationIdentity,
  mockIdentityA,
  replaceActorIdentity,
} from "@nfid/integration"

import { BtcAsset } from "./btc-asset"
import { BtcWallet } from "./btc-wallet"

describe("BTC suite", () => {
  jest.setTimeout(200000)

  let address = ""

  it("get btc address", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    replaceActorIdentity(btcWallet, delegationIdentity)
    address = await new BtcWallet().getBitcoinAddress()
    expect(address).toEqual("mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG")
  })

  it("get balance", async () => {
    const balance = await BtcAsset.getBalance(address)
    expect(balance).toMatchObject({
      balance: expect.any(BigNumber),
      balanceinUsd: expect.any(BigNumber),
    })
  })

  it("get activities to", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor: undefined,
      size: 1,
      direction: "to",
    })
    expect(txs.activities.length).toEqual(1)
    expect(txs).toEqual({
      activities: [
        {
          id: "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
          date: 1677154607,
          to: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          from: "tb1quza07ajckzu868chzsh2knfq4ucx6gaksh4rj0",
          transactionHash:
            "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
          price: 1333001,
        },
      ],
      cursor:
        "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
    })
  })

  it("get activities with cursor", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor:
        "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
      size: 2,
      direction: "to",
    })
    expect(txs.activities.length).toEqual(2)
    expect(txs).toEqual({
      activities: [
        {
          id: "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
          date: 1677154607,
          to: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          from: "tb1quza07ajckzu868chzsh2knfq4ucx6gaksh4rj0",
          transactionHash:
            "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
          price: 1333001,
        },
        {
          id: "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
          date: 1677141132,
          to: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          from: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          transactionHash:
            "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
          price: 10,
        },
      ],
      cursor:
        "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
    })
  })

  it("get activities from", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor: undefined,
      size: 1,
      direction: "from",
    })
    expect(txs.activities.length).toEqual(1)
    expect(txs).toEqual({
      activities: [
        {
          id: "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
          date: 1677141132,
          to: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          from: "mpEsrvBZnefm6QQLF1rn2trTp1UbrLaKhG",
          transactionHash:
            "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
          price: 1762762,
        },
      ],
      cursor:
        "e9b28d1365a148f7014ccfa3b8b5aea70854667b27dc830538be5333715f7564",
    })
  })
})
