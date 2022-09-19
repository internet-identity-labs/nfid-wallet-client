/**
 * @jest-environment jsdom
 */
import { getNFTDetails, getNFTsOfPrincipals } from "."
import { Principal } from "@dfinity/principal"
import { Account } from "frontend/integration/identity-manager"
// import { restCall as mockRest } from "frontend/integration/rosetta/util"
import { expect } from "@jest/globals"
import { NFTData } from "frontend/integration/entrepot/entrepot_interface"

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

  describe("getBalance", () => {
    it("should return correct balance.", async function() {
      let mockDetails = {
        id: "j3dqa-byaaa-aaaah-qcwfa-cai",
        priority: 10,
        name: "ICPCS",
        brief: "7,777 Internet Computers running on the IC",
        description: "ICPCS is a collection of generative art on the Internet Computer. Holders of ICPCS will be granted access to ICOS - a browser-based portal into the ICP ecosystem.",
        blurb: "ICPCS, or Internet Computers is a collection of 7,777 uniquely generated PC setups celebrating the evolution of the home PC. Holders will be granted exclusive perks, including access to: ICOS - a web-based, customizable and user friendly portal for everything IC related, with built-in utilities, dashboards, widgets, games and a dApp browser, as well as ICDM - a reflection rewards system for holders, tied to NRI.",
        keywords: "Utility DeFi Generative",
        web: "https://icpcs.io/",
        telegram: "",
        discord: "https://discord.com/invite/icpcs",
        twitter: "https://twitter.com/icpcsnft",
        medium: "https://icpcs.medium.com/",
        dscvr: "",
        distrikt: "",
        banner: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/nt13bt3/collection_banner.jpg",
        avatar: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/tb03b5i/avatar.jpg",
        collection: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/d923bee/collection_image.jpg",
        route: "icpcs",
        commission: 0.08,
        legacy: "",
        unit: "NFT",
        nftv: true,
        mature: false,
        market: true,
        dev: false,
        external: false,
        filter: false,
        sale: false,
        earn: true,
        saletype: "v1",
        standard: "legacy",
        detailpage: "generative_assets_on_nft_canister",
        nftlicense: "",
        kyc: false,
      }

      let info = new Response(JSON.stringify(mockDetails))
      // @ts-ignore
      mockRest = jest
        .fn()
        .mockReturnValue(Promise.resolve(info))
      let response = await getNFTDetails("j3dqa-byaaa-aaaah-qcwfa-cai")
    })
  })


})


