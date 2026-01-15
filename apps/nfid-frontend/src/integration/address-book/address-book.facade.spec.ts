import {
  addressBookCache,
  addressBookFacade,
  addressBookCanisterClient,
  icExplorerClient,
} from "./address-book.container"
import { ChainId, Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icExplorerAddressItemCacheIdb } from "@nfid/integration"
import { UserAddress, AddressType } from "./types"
import {
  ALICE_SAVE_REQUEST,
  BOB_SAVE_REQUEST,
  CHARLIE_SAVE_REQUEST,
  ALICE_ICP_ADDRESS_PREVIEW,
  ALICE_ICP_PRINCIPAL_PREVIEW,
  ALICE_BTC_PREVIEW,
  ALICE_EVM_PREVIEW,
  BOB_ICP_ADDRESS_PREVIEW,
  BOB_ICP_PRINCIPAL_PREVIEW,
  CHARLIE_BTC_PREVIEW,
  CHARLIE_EVM_PREVIEW,
  ALICE_ENTITY,
  BOB_ENTITY,
  CHARLIE_ENTITY,
} from "./address-book.mocks"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { mockIdentityA } from "packages/integration/src/lib/identity/mocks"
import { generateDelegationIdentity } from "packages/integration/src/lib/test-utils"
import { authState } from "packages/integration/src/lib/authentication/auth-state"

describe("Address Book", () => {
  jest.setTimeout(50000)

  describe("Data management", () => {
    beforeAll(async () => {
      const identity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
      const { delegationIdentity } = await generateDelegationIdentity(identity)
      await authState.set({ delegationIdentity })
    })

    beforeEach(async () => {
      await addressBookCanisterClient.deleteAll()
      addressBookCache.reset()
    })

    describe("findAll", () => {
      it("should return empty array when no addresses stored", async () => {
        // Given: empty backend
        // When: findAll is called
        const result = await addressBookFacade.findAll()

        // Then: should return empty array
        expect(result).toEqual([])
      })

      it("should return all addresses sorted alphabetically", async () => {
        // Given: three addresses saved via facade
        await addressBookFacade.save(CHARLIE_SAVE_REQUEST)
        await addressBookFacade.save(ALICE_SAVE_REQUEST)
        await addressBookFacade.save(BOB_SAVE_REQUEST)

        // When: findAll is called
        const result = await addressBookFacade.findAll()

        // Then: should return addresses sorted alphabetically
        expect(result).toHaveLength(3)
        expect(result[0]).toMatchObject(ALICE_SAVE_REQUEST)
        expect(result[1]).toMatchObject(BOB_SAVE_REQUEST)
        expect(result[2]).toMatchObject(CHARLIE_SAVE_REQUEST)
      })
    })

    describe("save", () => {
      it("should save new address and always generate UUID", async () => {
        // Given: a new address without id
        // When: save is called
        await addressBookFacade.save(CHARLIE_SAVE_REQUEST)

        // Then: should save with auto-generated UUID
        const all = await addressBookFacade.findAll()
        expect(all).toHaveLength(1)
        expect(all[0]).toMatchObject(CHARLIE_SAVE_REQUEST)
        expect(all[0].id).toBeTruthy()
        expect(all[0].id).toMatch(/^[0-9a-f-]{36}$/)
      })

      it("should save multiple addresses with unique UUIDs", async () => {
        // Given: two addresses to save
        // When: save is called multiple times
        await addressBookFacade.save(ALICE_SAVE_REQUEST)
        await addressBookFacade.save(BOB_SAVE_REQUEST)

        // Then: should generate unique UUIDs for each
        const all = await addressBookFacade.findAll()
        expect(all).toHaveLength(2)
        expect(all[0].id).not.toBe(all[1].id)
      })
    })

    describe("update", () => {
      it("should update existing address", async () => {
        // Given: an existing saved address
        await addressBookFacade.save(ALICE_SAVE_REQUEST)
        const addresses = await addressBookFacade.findAll()
        const alice = addresses.find((a) => a.name === "Alice")!

        // When: update is called with modified address
        const updated: UserAddress = {
          ...alice,
          name: "Alice Updated",
        }
        await addressBookFacade.update(updated)

        // Then: should update the address keeping the same id
        const all = await addressBookFacade.findAll()
        expect(all).toHaveLength(1)
        expect(all[0]).toMatchObject({
          ...ALICE_SAVE_REQUEST,
          name: "Alice Updated",
        })
        expect(all[0].id).toBe(alice.id)
      })

      it("should throw error when updating without id", async () => {
        // Given: an address without id
        const invalid: UserAddress = {
          id: "",
          name: "Invalid",
        }

        // When: update is called
        // Then: should throw error
        await expect(addressBookFacade.update(invalid)).rejects.toThrow(
          "Cannot update address without id",
        )
      })
    })

    describe("delete", () => {
      it("should delete address by id", async () => {
        // Given: two saved addresses
        await addressBookFacade.save(ALICE_SAVE_REQUEST)
        await addressBookFacade.save(BOB_SAVE_REQUEST)
        const addresses = await addressBookFacade.findAll()
        const alice = addresses.find((a) => a.name === "Alice")!

        // When: delete is called for Alice's id
        await addressBookFacade.delete(alice.id)

        // Then: should remove Alice and keep Bob
        const all = await addressBookFacade.findAll()
        expect(all).toHaveLength(1)
        expect(all[0]).toMatchObject(BOB_SAVE_REQUEST)
      })
    })

    describe("get", () => {
      it("should return full UserAddress object", async () => {
        // Given: a saved address
        await addressBookFacade.save(ALICE_SAVE_REQUEST)
        const addresses = await addressBookFacade.findAll()
        const alice = addresses.find((a) => a.name === "Alice")!

        // When: get is called with the id
        const address = await addressBookFacade.get(alice.id)

        // Then: should return the complete UserAddress object
        expect(address).toMatchObject(ALICE_SAVE_REQUEST)
        expect(address.id).toBe(alice.id)
      })

      it("should throw error when address not found", async () => {
        // Given: empty storage
        // When: get is called with non-existent id
        // Then: should throw error
        await expect(addressBookFacade.get("non-existent-id")).rejects.toThrow(
          "Address with id non-existent-id not found",
        )
      })
    })
  })

  describe("Search", () => {
    beforeEach(async () => {
      addressBookCache.reset()
      jest
        .spyOn(addressBookCanisterClient, "findAll")
        .mockResolvedValue([ALICE_ENTITY, BOB_ENTITY, CHARLIE_ENTITY])
    })

    afterEach(() => {
      jest.restoreAllMocks()
      addressBookCache.reset()
    })

    describe("ftSearch", () => {
      it("should filter by ICP Native (Account ID)", async () => {
        // When: searching for ICP Native tokens
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ICP,
          category: Category.Native,
        })

        // Then: should return ICP Account ID addresses only
        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining(ALICE_ICP_ADDRESS_PREVIEW),
            expect.objectContaining(BOB_ICP_ADDRESS_PREVIEW),
          ]),
        )
      })

      it("should filter by ICP non-Native (Principal)", async () => {
        // When: searching for ICP non-Native tokens (SNS)
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ICP,
          category: Category.Sns,
        })

        // Then: should return ICP Principal addresses only
        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining(ALICE_ICP_PRINCIPAL_PREVIEW),
            expect.objectContaining(BOB_ICP_PRINCIPAL_PREVIEW),
          ]),
        )
      })

      it("should filter by BTC", async () => {
        // When: searching for BTC addresses
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.BTC,
          category: Category.Native,
        })

        // Then: should return BTC addresses only
        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining(ALICE_BTC_PREVIEW),
            expect.objectContaining(CHARLIE_BTC_PREVIEW),
          ]),
        )
      })

      it("should filter by EVM", async () => {
        // When: searching for EVM addresses
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ETH,
          category: Category.Native,
        })

        // Then: should return EVM addresses only
        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining(ALICE_EVM_PREVIEW),
            expect.objectContaining(CHARLIE_EVM_PREVIEW),
          ]),
        )
      })

      it("should filter by nameOrAddressLike (case-insensitive)", async () => {
        // When: searching by partial name (lowercase)
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ICP,
          category: Category.Native,
          nameOrAddressLike: "ali",
        })

        // Then: should find Alice (case-insensitive)
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })

      it("should filter by addressLike (case-insensitive)", async () => {
        // When: searching by partial address
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ICP,
          category: Category.Native,
          addressLike: "d4685",
        })

        // Then: should find Alice's address
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })

      it("should support fuzzy name matching with typos", async () => {
        // When: searching by name with typo
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.ICP,
          category: Category.Native,
          nameOrAddressLike: "BAlice", // Typo: Alice
        })

        // Then: should find Alice with fuzzy matching
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })

      it("should support prefix address matching", async () => {
        // When: searching by address prefix
        const result = await addressBookFacade.ftSearch({
          chainId: ChainId.BTC,
          category: Category.Native,
          addressLike: "bc1qxy", // Prefix of Alice's BTC address
        })

        // Then: should find Alice's BTC address
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })
    })

    describe("nftSearch", () => {
      it("should return all addresses with ICP Principal", async () => {
        // When: searching for NFT addresses without filter
        const result = await addressBookFacade.nftSearch()

        // Then: should return only addresses with ICP Principal
        expect(result).toHaveLength(2)
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining(ALICE_ICP_PRINCIPAL_PREVIEW),
            expect.objectContaining(BOB_ICP_PRINCIPAL_PREVIEW),
          ]),
        )
      })

      it("should filter by nameOrAddressLike", async () => {
        // When: searching by partial name
        const result = await addressBookFacade.nftSearch({
          nameOrAddressLike: "bob",
        })

        // Then: should find Bob only (case-insensitive)
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Bob" })
      })

      it("should filter by addressLike", async () => {
        // When: searching by partial address
        const result = await addressBookFacade.nftSearch({
          addressLike: "aaaaa",
        })

        // Then: should find Alice's ICP Principal
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })

      it("should support fuzzy name search with typos", async () => {
        // When: searching by name with typo
        const result = await addressBookFacade.nftSearch({
          nameOrAddressLike: "BAlice", // Typo: Alice
        })

        // Then: should find Alice with fuzzy matching
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })

      it("should support prefix address matching for NFTs", async () => {
        // When: searching by address prefix
        const result = await addressBookFacade.nftSearch({
          addressLike: "aaaaa", // Prefix of Alice's ICP Principal
        })

        // Then: should find Alice's ICP Principal
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ name: "Alice" })
      })
    })

    describe("search", () => {
      it("should find exact address match", async () => {
        // When: searching by exact address
        const result = await addressBookFacade.search({
          address: "aaaaa-aa",
        })

        // Then: should find exactly one result - Alice's ICP Principal
        expect(result).toBeDefined()
        expect(result).toMatchObject(ALICE_ICP_PRINCIPAL_PREVIEW)
      })

      it("should return undefined when no exact match found", async () => {
        // Mock IC Explorer to return undefined (no match found)
        jest.spyOn(icExplorerClient, "find").mockResolvedValue({
          statusCode: 200,
          message: null,
          data: {
            tokenList: null,
            addressList: null,
          },
        })

        // When: searching by partial address (not exact match)
        const result = await addressBookFacade.search({
          address: "aaaaa",
        })

        // Then: should return undefined
        expect(result).toBeUndefined()
        expect(icExplorerClient.find).toHaveBeenCalledWith("aaaaa")
      })

      it("should match across all address types", async () => {
        // When: searching by exact BTC address
        const result = await addressBookFacade.search({
          address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        })

        // Then: should find exactly one result - Alice's BTC address
        expect(result).toBeDefined()
        expect(result).toMatchObject(ALICE_BTC_PREVIEW)
      })

      it("should be case-sensitive", async () => {
        // Mock IC Explorer to return undefined (no match found)
        jest.spyOn(icExplorerClient, "find").mockResolvedValue({
          statusCode: 200,
          message: null,
          data: {
            tokenList: null,
            addressList: null,
          },
        })

        // When: searching with different case
        const result = await addressBookFacade.search({
          address: "AAAAA-AA",
        })

        // Then: should return undefined (case doesn't match)
        expect(result).toBeUndefined()
        expect(icExplorerClient.find).toHaveBeenCalledWith("AAAAA-AA")
      })

      it("should find address from IC Explorer when not in local storage", async () => {
        // Given: empty local storage (IC Explorer will be queried)
        const mockResponse = {
          statusCode: 600,
          message: null,
          data: {
            tokenList: null,
            addressList: [
              {
                type: "address",
                symbol: null,
                ledgerId: null,
                priceUSD: null,
                alias: "SNS:YUKU-GOVERNANCE",
                principalId: "auadn-oqaaa-aaaaq-aacya-cai",
                accountId:
                  "3eddf794a9e64025238ef1a3c2e6bbf0bfd5a6e0dfa7cabef9e676921eabdafe",
                subaccountId:
                  "0000000000000000000000000000000000000000000000000000000000000000",
              },
            ],
          },
        }

        const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        } as Response)

        // When: searching for YUKU governance canister twice
        const result1 = await addressBookFacade.search({
          address: "auadn-oqaaa-aaaaq-aacya-cai",
        })

        const result2 = await addressBookFacade.search({
          address: "auadn-oqaaa-aaaaq-aacya-cai",
        })

        // Then: should return IC Explorer result for both searches
        const response = {
          name: "SNS:YUKU-GOVERNANCE",
          address: {
            type: AddressType.ICP_PRINCIPAL,
            value: "auadn-oqaaa-aaaaq-aacya-cai",
          },
        }

        expect(result1).toMatchObject(response)
        expect(result2).toMatchObject(response)

        // And: should call fetch only once due to caching
        // First call: fetch invoked, result cached by @Cache decorator
        // Second call: cache returns without invoking fetch
        expect(fetchSpy).toHaveBeenCalledTimes(1)
        expect(fetchSpy).toHaveBeenCalledWith(
          "https://api.icexplorer.io/api/dashboard/search",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ keyword: "auadn-oqaaa-aaaaq-aacya-cai" }),
          }),
        )
      })
    })
  })
})
