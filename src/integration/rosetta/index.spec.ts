/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import { TRANSACTION_HISTORY } from "frontend/integration/internet-identity/__mocks"

import { getBalance, getExchangeRate, getTransactionHistory } from "."

describe("rosetta suite", () => {
  describe("getBalance", () => {
    it("should return correct balance.", async function () {
      let response = await getBalance(
        Principal.fromText(
          "qykh3-evj5u-oahns-httff-2bp7z-vaqp4-smkrh-gdkqc-kfsyr-zkw5p-5ae",
        ),
      )
      // TODO Code review. Update GET_BALANCE
      expect(JSON.stringify(response)).toBe(
        '{"value":"0.0001","currency":{"symbol":"ICP","decimals":8}}',
      )
    })
  })

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

  describe("getExchangeRate", () => {
    it("should return correct exchange rate.", async function () {
      let response = await getExchangeRate()
      expect(typeof response).toBe("number")
    })
  })

  // describe("transfer", () => {
  //   it("should return correct exchange rate.", async function () {
  //     let expected = { Ok: BigInt(1) }
  //     // @ts-ignore
  //     ledger.transfer = jest.fn(async () => expected)
  //     let response = await transfer(
  //       1,
  //       "ad19832ac19044e892262b9b492a13c0b6310dccdceea99e27adf271829f3ea8",
  //       identity as any,
  //     )
  //     expect(response).toBe(expected)
  //   })
  // })
})
