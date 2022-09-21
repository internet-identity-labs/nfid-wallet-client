/**
 * @jest-environment jsdom
 */

import { getBalance } from "frontend/integration/rosetta"
import {
  getTokenTransactionHistory,
  getTokenTxHistoryOfTokenIndex,
  getUserTransactions,
} from "frontend/integration/cap/index"
import { Principal } from "@dfinity/principal"

describe("rosetta suite", () => {
  describe("getBalance", () => {
    it("should return correct balance.", async function() {
      let a = await
        getTokenTransactionHistory("dcbuw-wyaaa-aaaam-qapfq-cai", 0)
      console.log(a.data[40].details)
    })
  })
  // describe("getTT", () => {
  //   it("should return correct balance.", async function() {
  //     let a = await
  //       getUserTransactions("dcbuw-wyaaa-aaaam-qapfq-cai", Principal.fromText("rtoow-aed5e-e6vpe-yj46l-63vqp-2gbqw-vqdop-2mepz-ktptl-asbck-rqe"), 0)
  //     console.log(a)
  //   })
  // })
  // describe("getTT", () => {
  //   it("should return correct balance.", async function() {
  //     let a = await
  //       getTokenTxHistoryOfTokenIndex("ah2fs-fqaaa-aaaak-aalya-cai", BigInt(1), 0)
  //     console.log(a)
  //   })
  // })
})

  // [ 'token', { Text: 'oia7n-iakor-uwiaa-aaaaa-cqac6-aaqca-qbaa' } ],
