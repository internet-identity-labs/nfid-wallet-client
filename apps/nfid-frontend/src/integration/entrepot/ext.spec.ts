/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { expect } from "@jest/globals"
import { encodeTokenIdentifier, principalToAddress } from "ictool"

import { Balance } from "frontend/integration/_ic_api/ext.d"
import {
  listNFT,
  lockNFT,
  transferEXT,
  unListNFT,
} from "frontend/integration/entrepot/ext"
import { fetchCollectionTokens } from "frontend/integration/entrepot/lib"
import { transfer } from "frontend/integration/rosetta"

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
const allien = "p5jg7-6aaaa-aaaah-qcolq-cai"
const heroes = "poyn6-dyaaa-aaaah-qcfzq-cai"
const testCollectionTurtle = "jeghr-iaaaa-aaaah-qco7q-cai" //fl5nr-xiaaa-aaaai-qbjmq-cai ICTurtles on DAB and legacy API in Entrepot

describe("NFT EXT standard suite", () => {
  describe("ext nft", () => {
    jest.setTimeout(50000)
    //this test describes how to purchase nft
    //TODO skip after e2e done because it takes 0.03% from the transaction
    it.skip("should lock and buy", async function () {
      let price = 1000000
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      let token = "hdjt6-5ikor-uwiaa-aaaaa-b4ats-4aqca-aabhj-q"

      let owner = (await fetchCollectionTokens(allien)).find(
        (tok) => tok.tokenId === token,
      )?.owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idB : idA

      await listNFT(token, sourceIdentity, price)
      let address = await lockNFT(token, targetIdentity, price)
      await transfer(price, address, targetIdentity)
      let result = await unListNFT(token, targetIdentity)
      expect(result).toBe(true)
    })
    // it("should unlist", async function () {
    //   let price = 1000000
    //   let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
    //   let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
    //   let token = "3qtw7-xykor-uwiaa-aaaaa-b4aro-maqca-aaap6-a"

    //   let owner = (await fetchCollectionTokens(heroes)).find(
    //     (tok) => tok.tokenId === token,
    //   )?.owner
    //   let sourceIdentity =
    //     owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
    //   let targetIdentity =
    //     owner === principalToAddress(idA.getPrincipal() as any) ? idB : idA

    //   let listResult = await listNFT(token, sourceIdentity, price)
    //   expect(listResult).toBe(true)
    //   await unListNFT(token, sourceIdentity)
    //   await expect(lockNFT(token, targetIdentity, price)).rejects.toThrow(
    //     "Lock failed! Other : No listing!",
    //   )
    // })
    it("should transfer", async function () {
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      let owner = (await fetchCollectionTokens(testCollection)).find(
        (token) => token.tokenId === testToken,
      )?.owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let response: Balance = await transferEXT(
        testToken,
        sourceIdentity,
        principalToAddress(targetIdentity.getPrincipal() as any),
      )
      expect(response).toBe(BigInt(1))
    })

    //Looks like transferTo and transferFrom been wrapped with common interface.
    //For now, it's not really possible to get collection/token info for old canisters.
    //Probably canister wrapper used for all legacy interfaces,
    // and we can proceed with common transfer API for EXT
    it("should transfer wrapped canister", async function () {
      let testToken = encodeTokenIdentifier(testCollectionTurtle, 7322)
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      let owner = (await fetchCollectionTokens(testCollectionTurtle)).find(
        (token) => token.tokenId === testToken,
      )?.owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let response: Balance = await transferEXT(
        testToken,
        sourceIdentity,
        targetIdentity.getPrincipal().toText(),
      )
      expect(response).toBe(BigInt(1))
    })

    it("should throw Unauthorized error", async function () {
      let idA = Ed25519KeyIdentity.fromParsedJson(identityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(identityB)
      let owner = (await fetchCollectionTokens(testCollection)).find(
        (token) => token.tokenId === testToken,
      )?.owner
      let sourceIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idB : idA
      let targetIdentity =
        owner === principalToAddress(idA.getPrincipal() as any) ? idA : idB
      let transfer = transferEXT(
        testToken,
        sourceIdentity,
        principalToAddress(targetIdentity.getPrincipal() as any),
      )
      await expect(transfer).rejects.toThrow("Unauthorized")
    })
  })
})
