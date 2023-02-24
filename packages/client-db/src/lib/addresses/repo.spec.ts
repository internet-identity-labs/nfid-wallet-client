import { getScope } from "@nfid/integration"

import { STORAGE_KEY } from "./constants"
import { createAddress, readAddress } from "./repo"

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
    const scope = getScope("example.com", "123")
    const address = "0x2b6f14C88B256f2EbCb8e22267d5F726D0429a28"
    const expectedCache = {
      [scope]: address,
    }

    createAddress({
      hostname: "example.com",
      accountId: "123",
      address,
    })

    expect(mockedLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockedLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(expectedCache),
    )
  })

  it("should read an address", () => {
    const scope = getScope("example.com", "123")
    const address = "0x2b6f14C88B256f2EbCb8e22267d5F726D0429a28"
    const cache = {
      [scope]: address,
    }
    mockedLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(cache))

    const result = readAddress({
      hostname: "example.com",
      accountId: "123",
    })

    expect(mockedLocalStorage.getItem).toHaveBeenCalledTimes(1)
    expect(result).toEqual(address)
  })
})
