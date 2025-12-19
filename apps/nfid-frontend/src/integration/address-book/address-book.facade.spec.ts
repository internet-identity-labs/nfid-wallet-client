/**
 * @jest-environment jsdom
 */
import {
  addressBookCache,
  addressBookFacade,
  addressBookStorage,
} from "./address-book.container"
import { ChainId, Category } from "@nfid/integration/token/icrc1/enum/enums"
import { AddressType, UserAddress } from "./types"
import {
  ALICE,
  BOB,
  CHARLIE,
  ALICE_ENTITY,
  BOB_ENTITY,
  CHARLIE_ENTITY,
  ALICE_SAVE_REQUEST,
  BOB_SAVE_REQUEST,
  CHARLIE_SAVE_REQUEST,
} from "./address-book.mocks"

describe("Address Book Service test suite", () => {
  jest.setTimeout(35000)

  beforeEach(async () => {
    await addressBookStorage.clear()
    addressBookCache.reset()
  })

  describe("findAll", () => {
    it("should return empty array when no addresses stored", async () => {
      // Given: empty storage
      // When: findAll is called
      const result = await addressBookFacade.findAll()

      // Then: should return empty array
      expect(result).toEqual([])
    })

    it("should return all addresses sorted alphabetically", async () => {
      // Given: three addresses saved directly in storage with individual keys
      await addressBookStorage.set(CHARLIE_ENTITY.id, CHARLIE_ENTITY)
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)
      await addressBookStorage.set(BOB_ENTITY.id, BOB_ENTITY)

      // When: findAll is called
      const result = await addressBookFacade.findAll()

      // Then: should return addresses sorted alphabetically
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(ALICE)
      expect(result[1]).toEqual(BOB)
      expect(result[2]).toEqual(CHARLIE)
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
      expect(all[0].name).toBe("Charlie")
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
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)

      // When: update is called with modified address
      const updated: UserAddress = {
        ...ALICE,
        name: "Alice Updated",
      }
      await addressBookFacade.update(updated)

      // Then: should update the address keeping the same id
      const all = await addressBookFacade.findAll()
      expect(all).toHaveLength(1)
      expect(all[0].name).toBe("Alice Updated")
      expect(all[0].id).toBe(ALICE.id)
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
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)
      await addressBookStorage.set(BOB_ENTITY.id, BOB_ENTITY)

      // When: delete is called for Alice's id
      await addressBookFacade.delete(ALICE.id)

      // Then: should remove Alice and keep Bob
      const all = await addressBookFacade.findAll()
      expect(all).toHaveLength(1)
      expect(all[0]).toEqual(BOB)
    })
  })

  describe("get", () => {
    it("should return full UserAddress object", async () => {
      // Given: a saved address
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)

      // When: get is called with the id
      const address = await addressBookFacade.get(ALICE.id)

      // Then: should return the complete UserAddress object
      expect(address).toEqual(ALICE)
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

  describe("ftSearch", () => {
    beforeEach(async () => {
      // Given: two addresses with ICP addresses
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)
      await addressBookStorage.set(BOB_ENTITY.id, BOB_ENTITY)
    })

    it("should filter by ICP Native (Account ID)", async () => {
      // When: searching for ICP Native tokens
      const result = await addressBookFacade.ftSearch({
        chainId: ChainId.ICP,
        category: Category.Native,
      })

      // Then: should return ICP Account ID addresses only
      expect(result).toHaveLength(2)
      expect(
        result.every((r) => r.address.type === AddressType.ICP_ADDRESS),
      ).toBe(true)
    })

    it("should filter by ICP non-Native (Principal)", async () => {
      // When: searching for ICP non-Native tokens (SNS)
      const result = await addressBookFacade.ftSearch({
        chainId: ChainId.ICP,
        category: Category.Sns,
      })

      // Then: should return ICP Principal addresses only
      expect(result).toHaveLength(2)
      expect(
        result.every((r) => r.address.type === AddressType.ICP_PRINCIPAL),
      ).toBe(true)
    })

    it("should filter by BTC", async () => {
      // Given: an additional address with BTC
      await addressBookStorage.set(CHARLIE_ENTITY.id, CHARLIE_ENTITY)

      // When: searching for BTC addresses
      const result = await addressBookFacade.ftSearch({
        chainId: ChainId.BTC,
        category: Category.Native,
      })

      // Then: should return BTC addresses only
      expect(result).toHaveLength(2)
      expect(result.every((r) => r.address.type === AddressType.BTC)).toBe(true)
    })

    it("should filter by EVM", async () => {
      // Given: an additional address with EVM
      await addressBookStorage.set(CHARLIE_ENTITY.id, CHARLIE_ENTITY)

      // When: searching for EVM addresses
      const result = await addressBookFacade.ftSearch({
        chainId: ChainId.ETH,
        category: Category.Native,
      })

      // Then: should return EVM addresses only
      expect(result).toHaveLength(2)
      expect(result.every((r) => r.address.type === AddressType.ETH)).toBe(true)
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
      expect(result[0].name).toBe("Alice")
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
      expect(result[0].name).toBe("Alice")
    })
  })

  describe("nftSearch", () => {
    beforeEach(async () => {
      // Given: three addresses (Alice and Bob have ICP Principal, Charlie doesn't)
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)
      await addressBookStorage.set(BOB_ENTITY.id, BOB_ENTITY)
      await addressBookStorage.set(CHARLIE_ENTITY.id, CHARLIE_ENTITY)
    })

    it("should return all addresses with ICP Principal", async () => {
      // When: searching for NFT addresses without filter
      const result = await addressBookFacade.nftSearch()

      // Then: should return only addresses with ICP Principal
      expect(result).toHaveLength(2)
      expect(
        result.every((r) => r.address.type === AddressType.ICP_PRINCIPAL),
      ).toBe(true)
    })

    it("should filter by nameOrAddressLike", async () => {
      // When: searching by partial name
      const result = await addressBookFacade.nftSearch({
        nameOrAddressLike: "bob",
      })

      // Then: should find Bob only (case-insensitive)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Bob")
    })

    it("should filter by addressLike", async () => {
      // When: searching by partial address
      const result = await addressBookFacade.nftSearch({
        addressLike: "aaaaa",
      })

      // Then: should find Alice's ICP Principal
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("Alice")
    })
  })

  describe("search", () => {
    beforeEach(async () => {
      // Given: two saved addresses
      await addressBookStorage.set(ALICE_ENTITY.id, ALICE_ENTITY)
      await addressBookStorage.set(BOB_ENTITY.id, BOB_ENTITY)
    })

    it("should filter by address substring (case-insensitive)", async () => {
      // When: searching by partial address
      const result = await addressBookFacade.search({
        address: "aaaaa",
      })

      // Then: should find Alice's ICP Principal
      expect(result.length).toBeGreaterThan(0)
      expect(result.some((r) => r.name === "Alice")).toBe(true)
    })

    it("should match across all address types", async () => {
      // Given: an additional address with BTC
      await addressBookStorage.set(CHARLIE_ENTITY.id, CHARLIE_ENTITY)

      // When: searching by BTC address prefix
      const result = await addressBookFacade.search({
        address: "bc1q",
      })

      // Then: should find all BTC addresses
      expect(result).toHaveLength(2)
      expect(
        result.every((r) => r.address.value.toLowerCase().includes("bc1q")),
      ).toBe(true)
    })
  })
})
