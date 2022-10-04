/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { expect } from "@jest/globals"
import { principalToAddress } from "ictool"

import { Balance, TransferResult } from "frontend/integration/_ic_api/ext.did"
import { fetchCollectionTokens } from "frontend/integration/entrepot/lib"
import { transferNFT } from "frontend/integration/entrepot/transfer"
import { EntrepotCollection } from "frontend/integration/entrepot/types"

import { collection } from "."

const identityA: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]
const identityB: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321006f44d47fef5734e70964019e827b38e194474305f289efc3cd89f5f60ffb1316",
  "abe201b97c13fd6fc378d857deebb9b84e058a320a87b7cbacfb2ab69fab1e4a6f44d47fef5734e70964019e827b38e194474305f289efc3cd89f5f60ffb1316",
]
const testToken = "m2qxv-aqkor-uwiaa-aaaaa-b4ats-4aqca-aaelv-q"
const testCollection = "p5jg7-6aaaa-aaaah-qcolq-cai"

describe("NFT transfer suite", () => {
  describe("ext", () => {
    jest.setTimeout(20000)
    it("should transfer", async function () {
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      // @ts-ignore
      let ex: EntrepotCollection = { id: testCollection }
      // @ts-ignore
      let owner = (await fetchCollectionTokens(ex)).find(
        (token) => token.tokenId === testToken,
      ).owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let response: Balance = await transferNFT(
        testToken,
        sourceIdentity,
        principalToAddress(targetIdentity.getPrincipal() as any),
      )
      expect(response).toBe(BigInt(1))
    })

    it("should throw Unauthorized error", async function () {
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      // @ts-ignore
      let ex: EntrepotCollection = { id: testCollection }
      // @ts-ignore
      let owner = (await fetchCollectionTokens(ex)).find(
        (token) => token.tokenId === testToken,
      ).owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idB : idA
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let transfer = transferNFT(
        testToken,
        sourceIdentity,
        principalToAddress(targetIdentity.getPrincipal() as any),
      )
      await expect(transfer).rejects.toThrow("Unauthorized")
    })
  })
})
