/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"
import { encodeTokenIdentifier } from "ictool"

import * as mockUtil from "frontend/integration/cap/cap_util"
import * as mock from "frontend/integration/cap/fungible-transactions"
import { mockTransaction } from "frontend/integration/internet-identity/__mocks"

describe("cap suite", () => {
  describe("cat txHistory", () => {
    it("getUserTransactions", async function () {
      let address =
        "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
      let mockTransactionTo: TransactionPrettified = mockTransaction
      mockTransactionTo.details.to =
        "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
      let mockTransactionFrom: TransactionPrettified = mockTransaction
      mockTransactionFrom.details.from =
        "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
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
      let mockTransactionToken: TransactionPrettified = mockTransaction
      mockTransactionToken.details.token = encodedToken
      jest
        .spyOn(mockUtil, "getCapRootTransactions")
        .mockReturnValue(Promise.resolve([mockTransactionToken]))
      let response = await mock.getTokenTxHistoryOfTokenIndex(
        "dcbuw-wyaaa-aaaam-qapfq-cai",
        "z4j3m-4akor-uwiaa-aaaaa-deadz-maqca-aaabm-q",
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
