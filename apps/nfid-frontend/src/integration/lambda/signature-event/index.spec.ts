/**
 * @jest-environment jsdom
 */
import {
  SignatureEvent,
  TransferSignatureEvent,
} from "src/integration/lambda/signature-event/basic-event"
import { storeSignatureEvent } from "src/integration/lambda/signature-event/index"

describe("Signature event suite", () => {
  jest.setTimeout(50000)

  describe("Store Signature In Test", () => {
    it("sore transfer", async function () {
      try {
        const event: TransferSignatureEvent = {
          application: "unit_test_FE",
          chain: "Internet Computer",
          eventType: SignatureEvent.TRANSFER,
          from: "a",
          to: "b",
          token: "ICP",
          value: 1,
        }
        let resp = await storeSignatureEvent(event)
        expect(resp.status).toBe(200)
      } catch (e) {
        throw new Error("Should not fail")
      }
    })
  })
})
