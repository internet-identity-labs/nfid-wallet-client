/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import { NFTData } from "frontend/integration/entrepot/entrepot_interface"
import { Account } from "frontend/integration/identity-manager"
import { nftCollectionInfo } from "frontend/integration/internet-identity/__mocks"
import { restCall as mockRest } from "frontend/integration/rosetta/util"

import { getNFTDetails, getNFTsOfPrincipals } from "."

const Readable = require("stream").Readable

describe("Entrepot suite", () => {
  describe("getNFTsOfPrincipals", () => {
    it("should return correct NFTs.", async function () {
      let mock = [
        {
          canisterId: "dcbuw-wyaaa-aaaam-qapfq-cai",
          imageUrl: "imageURL",
          owner: "921",
          tokenId: "xwg5r-jakor-uwiaa-aaaaa-deadz-maqca-aaams-q",
        },
      ]
      let rr = new Response(JSON.stringify(mock))
      // @ts-ignore
      mockRest = jest.fn().mockReturnValue(Promise.resolve(rr))
      let principal = Principal.fromText(
        "rtoow-aed5e-e6vpe-yj46l-63vqp-2gbqw-vqdop-2mepz-ktptl-asbck-rqe",
      )
      let acc: Account = { accountId: "", domain: "", label: "" }
      let response: NFTData[] = await getNFTsOfPrincipals([
        { principal: principal, account: acc },
      ])
      expect(response[0].principal).toBe(principal)
      expect(response[0].account).toBe(acc)
      expect(response[0].canisterId).toBe("dcbuw-wyaaa-aaaam-qapfq-cai")
      expect(response[0].imageUrl).toBe("imageURL")
      expect(response[0].owner).toBe("921")
      expect(response[0].tokenId).toBe(
        "xwg5r-jakor-uwiaa-aaaaa-deadz-maqca-aaams-q",
      )
    })
  })

  describe("getNFTDetails", () => {
    it("should return correct collection details.", async function () {
      let info = new Response(JSON.stringify([nftCollectionInfo]))
      // @ts-ignore
      mockRest = jest.fn().mockReturnValue(Promise.resolve(info))
      let response = await getNFTDetails("j3dqa-byaaa-aaaah-qcwfa-cai")
      expect(
        JSON.stringify(response) === JSON.stringify(nftCollectionInfo),
      ).toBe(true)
    })
  })
})
