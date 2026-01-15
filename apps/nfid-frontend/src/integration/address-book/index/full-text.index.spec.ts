import { FullTextIndex } from "./full-text.index"
import { FullTextMapper } from "../mapper/full-text.mapper"
import { AddressType } from "../types"
import {
  ALICE_ENTITY,
  BOB_ENTITY,
  CHARLIE_ENTITY,
  ALICE_ICP_PRINCIPAL_PREVIEW,
  ALICE_BTC_PREVIEW,
  ALICE_EVM_PREVIEW,
  BOB_ICP_PRINCIPAL_PREVIEW,
  CHARLIE_BTC_PREVIEW,
  CHARLIE_EVM_PREVIEW,
} from "../address-book.mocks"

describe("FullTextIndex", () => {
  let index: FullTextIndex
  let mapper: FullTextMapper

  beforeEach(() => {
    mapper = new FullTextMapper()
    index = new FullTextIndex(mapper)
    index.rebuild([ALICE_ENTITY, BOB_ENTITY, CHARLIE_ENTITY])
  })

  describe("searchByNameOrAddressAndType", () => {
    it.each([
      {
        query: "BAlice",
        type: AddressType.ICP_PRINCIPAL,
        expectedCount: 1,
        expectedResult: ALICE_ICP_PRINCIPAL_PREVIEW,
        description: "search by name (case insensitive)",
      },
      {
        query: "alice",
        type: AddressType.BTC,
        expectedCount: 1,
        expectedResult: ALICE_BTC_PREVIEW,
        description: "search same name with different type",
      },
      {
        query: "alic",
        type: AddressType.ICP_PRINCIPAL,
        expectedCount: 1,
        expectedResult: ALICE_ICP_PRINCIPAL_PREVIEW,
        description: "search by partial name",
      },
      {
        query: "xyz",
        type: AddressType.ICP_PRINCIPAL,
        expectedCount: 0,
        expectedResult: null,
        description: "search with non-existent name returns empty",
      },
    ])(
      "should $description",
      ({ query, type, expectedCount, expectedResult }) => {
        const result = index.searchByNameOrAddressAndType(query, type)

        expect(result).toHaveLength(expectedCount)
        if (expectedResult) {
          expect(result[0]).toMatchObject(expectedResult)
        }
      },
    )
  })

  describe("searchByAddressAndType", () => {
    it.each([
      {
        query: "bc1qar0srrr",
        type: AddressType.BTC,
        expectedCount: 1,
        expectedResult: CHARLIE_BTC_PREVIEW,
        description: "search by partial BTC address",
      },
      {
        query: "aaaaa-aa",
        type: AddressType.ICP_PRINCIPAL,
        expectedCount: 1,
        expectedResult: ALICE_ICP_PRINCIPAL_PREVIEW,
        description: "search by full ICP principal",
      },
      {
        query: "0x8B3192",
        type: AddressType.ETH,
        expectedCount: 1,
        expectedResult: CHARLIE_EVM_PREVIEW,
        description: "search by partial ETH address",
      },
      {
        query: "wrongaddress",
        type: AddressType.BTC,
        expectedCount: 0,
        expectedResult: null,
        description: "search with non-existent address returns empty",
      },
    ])(
      "should $description",
      ({ query, type, expectedCount, expectedResult }) => {
        const result = index.searchByAddressAndType(query, type)

        expect(result).toHaveLength(expectedCount)
        if (expectedResult) {
          expect(result[0]).toMatchObject(expectedResult)
        }
      },
    )
  })

  describe("searchByType", () => {
    it.each([
      {
        type: AddressType.ICP_PRINCIPAL,
        expectedCount: 2,
        expectedResults: [
          ALICE_ICP_PRINCIPAL_PREVIEW,
          BOB_ICP_PRINCIPAL_PREVIEW,
        ],
        description: "return all ICP principals (multiple results)",
      },
      {
        type: AddressType.BTC,
        expectedCount: 2,
        expectedResults: [ALICE_BTC_PREVIEW, CHARLIE_BTC_PREVIEW],
        description: "return all BTC addresses",
      },
      {
        type: AddressType.ETH,
        expectedCount: 2,
        expectedResults: [ALICE_EVM_PREVIEW, CHARLIE_EVM_PREVIEW],
        description: "return all ETH addresses",
      },
    ])("should $description", ({ type, expectedCount, expectedResults }) => {
      const result = index.searchByType(type)

      expect(result).toHaveLength(expectedCount)
      expectedResults.forEach((expectedResult, index) => {
        expect(result[index]).toMatchObject(expectedResult)
      })
    })
  })
})
