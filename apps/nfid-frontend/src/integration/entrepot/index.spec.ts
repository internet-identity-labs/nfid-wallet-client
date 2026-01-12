/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import { Account } from "@nfid/integration"

import { collection, principalTokens } from "."
import { collection as mockCollection } from "./__mock"
import { UserNFTDetails } from "./types"

describe("Entrepot suite", () => {
  describe("getNFTsOfPrincipals", () => {
    it("should return correct NFTs.", async function () {
      const mock = [
        {
          canisterId: mockCollection.id,
          tokenId: "4tkih-zykor-uwiaa-aaaaa-cmacg-aaqca-aaaaa-q",
        },
      ]
      const rr = new Response(JSON.stringify(mock))
      jest
        .spyOn(global, "fetch")
        .mockImplementation((url: RequestInfo | URL): Promise<Response> => {
          if (url.toString().includes("/api/maddies/getAllNfts")) {
            return Promise.resolve({ ...rr, json: async () => mock })
          } else if (url.toString().includes("api/collections")) {
            return Promise.resolve({
              ...rr,
              json: async () => [mockCollection],
            })
          } else {
            throw url.toString()
          }
        })
      const principal = Principal.fromText(
        "rtoow-aed5e-e6vpe-yj46l-63vqp-2gbqw-vqdop-2mepz-ktptl-asbck-rqe",
      )
      const acc: Account = { accountId: "", domain: "", label: "" }
      const response: UserNFTDetails[] = await principalTokens([
        { principal: principal, account: acc },
      ])
      expect(response[0].principal).toBe(principal)
      expect(response[0].account).toBe(acc)
      expect(response[0].canisterId).toBe("nges7-giaaa-aaaaj-qaiya-cai")
      expect(response[0].assetPreview.url).toBe(
        "https://images.entrepot.app/t/nges7-giaaa-aaaaj-qaiya-cai/4tkih-zykor-uwiaa-aaaaa-cmacg-aaqca-aaaaa-q",
      )
      expect(response[0].tokenId).toBe(
        "4tkih-zykor-uwiaa-aaaaa-cmacg-aaqca-aaaaa-q",
      )
      expect(response[0].index).toBeDefined()
      expect(response[0].assetFullsize).toBeDefined()
    })
  })

  describe("collection", () => {
    it("should return correct collection details.", async function () {
      const info = new Response(JSON.stringify([mockCollection]))
      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve({ ...info, json: async () => [mockCollection] }),
        )
      const response = await collection("nges7-giaaa-aaaaj-qaiya-cai")
      expect(JSON.stringify(response)).toBe(JSON.stringify(mockCollection))
    })
  })
})
