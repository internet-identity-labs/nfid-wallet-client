/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { expect } from "@jest/globals"
import { encodeTokenIdentifier, principalToAddress } from "ictool"

import { mockIdentityA, mockIdentityB } from "@nfid/integration"
import { transfer } from "@nfid/integration/token/icp"

import { Balance } from "frontend/integration/_ic_api/ext.d"
import {
  listNFT,
  lockNFT,
  transferEXT,
  unListNFT,
} from "frontend/integration/entrepot/ext"
import { fetchCollectionTokens } from "frontend/integration/entrepot/lib"

const testToken = "m2qxv-aqkor-uwiaa-aaaaa-b4ats-4aqca-aaelv-q"
const testCollection = "p5jg7-6aaaa-aaaah-qcolq-cai"
const allien = "p5jg7-6aaaa-aaaah-qcolq-cai"
const testCollectionTurtle = "jeghr-iaaaa-aaaah-qco7q-cai" //fl5nr-xiaaa-aaaai-qbjmq-cai ICTurtles on DAB and legacy API in Entrepot

describe("NFT EXT standard suite", () => {
  describe("ext nft", () => {
    jest.setTimeout(50000)
    //this test describes how to purchase nft
    //TODO skip after e2e done because it takes 0.03% from the transaction
    it.skip("should lock and buy", async function () {
      let price = 1000000
      let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)
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
      await transfer({ amount: price, to: address, identity: targetIdentity })
      let result = await unListNFT(token, targetIdentity)
      expect(result).toBe(true)
    })
    // it("should unlist", async function () {
    //   let price = 1000000
    //   let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    //   let idB = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)
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
      let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)
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
        AccountIdentifier.fromPrincipal({
          principal: targetIdentity.getPrincipal(),
        }).toHex(),
      )
      expect(response).toBe(BigInt(1))
    })

    //Looks like transferTo and transferFrom been wrapped with common interface.
    //For now, it's not really possible to get collection/token info for old canisters.
    //Probably canister wrapper used for all legacy interfaces,
    // and we can proceed with common transfer API for EXT
    it("should transfer wrapped canister", async function () {
      let testToken = encodeTokenIdentifier(testCollectionTurtle, 7322)
      let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)
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
      let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      let idB = Ed25519KeyIdentity.fromParsedJson(mockIdentityB)
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
        AccountIdentifier.fromPrincipal({
          principal: targetIdentity.getPrincipal(),
        }).toHex(),
      )
      await expect(transfer).rejects.toThrow("Unauthorized")
    })
  })
})
