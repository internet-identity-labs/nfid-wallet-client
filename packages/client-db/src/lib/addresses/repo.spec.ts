import { STORAGE_KEY } from "./constants"
import {
  storeAddressInLocalCache,
  readAddressFromLocalCache,
  getKey,
} from "./repo"
import { NetworkKey } from "./types"

describe("address repo", () => {
  const mockedLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  }

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockedLocalStorage,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should create an address", () => {
    const key = getKey({
      hostname: "example.com",
      accountId: "123",
      anchor: BigInt(10000),
    })
    const address = "0x2b6f14C88B256f2EbCb8e22267d5F726D0429a28"
    const expectedCache = {
      [key]: { EVM: address },
    }

    storeAddressInLocalCache({
      hostname: "example.com",
      accountId: "123",
      address,
      anchor: BigInt(10000),
      network: NetworkKey.EVM,
    })

    expect(mockedLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockedLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(expectedCache),
    )
  })

  it("should read an address", () => {
    const key = getKey({
      hostname: "example.com",
      accountId: "123",
      anchor: BigInt(10000),
    })
    const address = "0x2b6f14C88B256f2EbCb8e22267d5F726D0429a28"
    const cache = {
      [key]: { EVM: address },
    }
    mockedLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(cache))

    const result = readAddressFromLocalCache({
      hostname: "example.com",
      accountId: "123",
      anchor: BigInt(10000),
      network: NetworkKey.EVM,
    })

    expect(mockedLocalStorage.getItem).toHaveBeenCalledTimes(1)
    expect(result).toEqual(address)
  })
})
