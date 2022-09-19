/**
 * @jest-environment jsdom
 */
import { getNFTDetails, getNFTsOfPrincipals } from "."
import { Principal } from "@dfinity/principal"
import { Account } from "frontend/integration/identity-manager"
import { restCall as mockRest } from "frontend/integration/rosetta/util"
import { expect } from "@jest/globals"
import { NFTData } from "frontend/integration/entrepot/entrepot_interface"
import { nftCollectionInfo } from "frontend/integration/internet-identity/__mocks"
import _ from "lodash"

const Readable = require("stream").Readable

describe("rosetta suite", () => {
  // describe("getBalance", () => {
  //   it("should return correct balance.", async function() {
  //     let mock = [{
  //       canisterId: "dcbuw-wyaaa-aaaam-qapfq-cai",
  //       imageUrl: "imageURL",
  //       owner: "921",
  //       tokenId: "xwg5r-jakor-uwiaa-aaaaa-deadz-maqca-aaams-q",
  //     }]
  //     let rr = new Response(JSON.stringify(mock))
  //     // @ts-ignore
  //     mockRest = jest
  //       .fn()
  //       .mockReturnValue(Promise.resolve(rr))
  //     let principal = Principal.fromText("rtoow-aed5e-e6vpe-yj46l-63vqp-2gbqw-vqdop-2mepz-ktptl-asbck-rqe")
  //     let acc: Account = { accountId: "", domain: "", label: "" }
  //     let response: NFTData[] = await getNFTsOfPrincipals([{ principal: principal, account: acc }])
  //     expect(response[0].principal).toBe(principal)
  //     expect(response[0].account).toBe(acc)
  //     expect(response[0].canisterId).toBe("dcbuw-wyaaa-aaaam-qapfq-cai")
  //     expect(response[0].imageUrl).toBe("imageURL")
  //     expect(response[0].owner).toBe( "921")
  //     expect(response[0].tokenId).toBe( "xwg5r-jakor-uwiaa-aaaaa-deadz-maqca-aaams-q")
  //   })
  // })

  describe("getNFTDetails", () => {
    it("should return correct details.", async function() {

      let info = new Response(JSON.stringify([nftCollectionInfo]))
      // @ts-ignore
      mockRest = jest
        .fn()
        .mockReturnValue(Promise.resolve(info))
      let response = await getNFTDetails("j3dqa-byaaa-aaaah-qcwfa-cai")
      let b =_.isEqual(response , info )
      console.log(b)
    })
  })


})


