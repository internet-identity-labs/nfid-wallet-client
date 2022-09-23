/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { encodeTokenIdentifier } from "ictool"

import * as mockUtil from "frontend/integration/cap/cap_util"
import * as mock from "frontend/integration/cap/index"

describe("cap suite", () => {
  describe("cat txHistory", () => {
    it("getUserTransactions", async function () {
      let encodedToken = encodeTokenIdentifier(
        "dcbuw-wyaaa-aaaam-qapfq-cai",
        89,
      )
      let detailsTo = {
        to: "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b",
        from: "84162df231ae9d4d9a38cae8ce7f263ed29d730706abf2b3dda1e8859d86f1a8",
        token: encodedToken,
        balance: BigInt(1),
      }
      let detailsFrom = {
        to: "a17518efac3544ce0528858335775dec6090dfaf1b52d970208d20899c5e59ab",
        from: "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b",
        token: encodedToken,
        balance: BigInt(1),
      }
      let mockTransactionTo: TransactionPrettified = {
        caller: Principal.fromText(
          "tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae",
        ),
        details: detailsTo,
        operation: "",
        time: BigInt(1),
      }
      let mockTransactionFrom: TransactionPrettified = {
        caller: Principal.fromText(
          "tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae",
        ),
        details: detailsFrom,
        operation: "",
        time: BigInt(1),
      }
      jest
        .spyOn(mockUtil, "getCapRootTransactions")
        .mockImplementationOnce(() => Promise.resolve([mockTransactionTo]))
        .mockImplementationOnce(() => Promise.resolve([mockTransactionFrom]))
        .mockImplementationOnce(() => Promise.resolve([]))
      let response = await mock.getUserTransactions(
        "dcbuw-wyaaa-aaaam-qapfq-cai",
        Principal.fromText(
          "tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae",
        ),
        0,
        3,
      )
      expect(response.txHistory.length).toEqual(2)
      expect(response.txHistory[0]).toEqual(mockTransactionTo)
      expect(response.txHistory[1]).toEqual(mockTransactionFrom)
      expect(response.isLastPage).toEqual(true)
    })

    it("getTokenTxHistoryOfTokenIndex", async function () {
      let encodedToken = encodeTokenIdentifier(
        "dcbuw-wyaaa-aaaam-qapfq-cai",
        89,
      )
      let details = {
        to: "a17518efac3544ce0528858335775dec6090dfaf1b52d970208d20899c5e59ab",
        from: "84162df231ae9d4d9a38cae8ce7f263ed29d730706abf2b3dda1e8859d86f1a8",
        token: encodedToken,
        balance: BigInt(1),
      }
      let mockTransaction: TransactionPrettified = {
        caller: Principal.fromText(
          "tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae",
        ),
        details: details,
        operation: "",
        time: BigInt(1),
      }

      jest
        .spyOn(mockUtil, "getCapRootTransactions")
        .mockReturnValue(Promise.resolve([mockTransaction]))
      let response = await mock.getTokenTxHistoryOfTokenIndex(
        "dcbuw-wyaaa-aaaam-qapfq-cai",
        89,
        0,
        2,
      )
      expect(response.txHistory.length).toEqual(2)
      expect(response.txHistory[0]).toEqual(mockTransaction)
      expect(response.txHistory[1]).toEqual(mockTransaction)
      expect(response.isLastPage).toEqual(false)
    })
  })
})
