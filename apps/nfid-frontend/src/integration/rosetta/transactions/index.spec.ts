import { Principal } from "@dfinity/principal"

import { TRANSACTION_HISTORY } from "frontend/integration/internet-identity/__mocks"

import { getTransactionHistory } from "."

describe("getTransactionHistory", () => {
  it("should return correct transaction history.", async function () {
    let response = await getTransactionHistory(
      Principal.fromText(
        "qykh3-evj5u-oahns-httff-2bp7z-vaqp4-smkrh-gdkqc-kfsyr-zkw5p-5ae",
      ),
    )
    // TODO Code review. Update TRANSACTION_HISTORY
    expect(JSON.stringify(response)).toBe(TRANSACTION_HISTORY)
  })
})
