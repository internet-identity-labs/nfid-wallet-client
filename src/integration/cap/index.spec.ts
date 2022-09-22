/**
 * @jest-environment jsdom
 */
import * as mock from "frontend/integration/cap/index"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { Principal } from "@dfinity/principal"
import { encodeTokenIdentifier } from "ictool"
import { CapRoot, CapRouter, GetTransactionResponse } from "@psychedelic/cap-js"

import { getCapRoot as mock3} from "frontend/integration/cap/cap_util"
import { restCall as mockRest } from "frontend/integration/rosetta/util"

describe("rosetta suite", () => {
  // describe("getBalance", () => {
    // it("should return correct balance.", async function() {
  //     let b = {
  //       to: "a17518efac3544ce0528858335775dec6090dfaf1b52d970208d20899c5e59ab",
  //       from: "84162df231ae9d4d9a38cae8ce7f263ed29d730706abf2b3dda1e8859d86f1a8",
  //       token: "3lezw-oikor-uwiaa-aaaaa-deadz-maqca-aaaac-a",
  //       balance: BigInt(1),
  //     }
  //
  //     let mockTransaction: TransactionPrettified = {
  //       caller: Principal.fromText("tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae"),
  //       details: b, operation: "", time: BigInt(1),
  //     }
  //     // @ts-ignore
  //     mock.getTokenTransactionHistory = jest.fn().mockReturnValue(Promise.resolve([mockTransaction]))
  //
  //     let transactions = await
  //       mock.getTokenTransactionHistory("dcbuw-wyaaa-aaaam-qapfq-cai", 0)
  //     console.log(transactions)
  //   })
  // })
  // describe("getTT", () => {
  //   it("should return correct balance.", async function() {
  //     let a = await
  //       mock2("4zv6l-2aaaa-aaaaj-qauua-cai", Principal.fromText("tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae"), 0)
  //
  //
  //     console.log(a)
  //   })
  // })
  describe("getTT", () => {

    it("should return correct balance.", async function() {
      // @ts-ignore
      // mock3 = jest.fn().mockReturnValue(Promise.resolve(CapRootMock.init({})))
      let encodedToken = encodeTokenIdentifier("dcbuw-wyaaa-aaaam-qapfq-cai", 89)
      let details = {
        to: "a17518efac3544ce0528858335775dec6090dfaf1b52d970208d20899c5e59ab",
        from: "84162df231ae9d4d9a38cae8ce7f263ed29d730706abf2b3dda1e8859d86f1a8",
        token: encodedToken,
        balance: BigInt(1),
      }
      let mockTransaction: TransactionPrettified = {
        caller: Principal.fromText("tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae"),
        details: details, operation: "", time: BigInt(1),
      }

      // @ts-ignore
      mock.getTokenTransactionHistory = jest.fn().mockReturnValue(Promise.resolve([mockTransaction]))
      let a = await mock.getTokenTxHistoryOfTokenIndex("dcbuw-wyaaa-aaaam-qapfq-cai", 0,  0 , 5)
      console.log(a)
    })
  })
})
// "z4j3m-4akor-uwiaa-aaaaa-deadz-maqca-aaabm-q"
//  index: 89, canister: 'dcbuw-wyaaa-aaaam-qapfq-cai'   '3lezw-oikor-uwiaa-aaaaa-deadz-maqca-aaaac-a'
export class CapRootMock extends CapRoot {
  async get_transaction(id: BigInt, witness = false) {
    return {
      data: [
        {
          time: 1,
          operation: 'transfer',
          details:    [
              [
                'to',
                {
                  Text: '7fdc2a0c6daa147f9109340f254e8b086cee5e7be618dc6ce805d365fd541143'
                }
              ],
            [
              'from',
        {
          Text: 'ec0b530ff3b88e46c2b058bbf00da13c0a2ba0952b587704255f2a12120166af'
        }
      ],
      [ 'token', { Text: '73sdd-tqkor-uwiaa-aaaaa-deadz-maqca-aaang-q' } ],
    [ 'balance', { U64: 1 } ]
  ]
  ,
          caller: Principal.anonymous()
        },
      ],
      page: 0,
      witness: []
    }



  }


}
