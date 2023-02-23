import { STORAGE_KEY } from "./constants"
import { createConnection, readConnection } from "./repo"

describe("connection repo", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should create a new connection and update local storage", () => {
    const cache = {
      existingConnection: { accountId: "123", domain: "example.com" },
    }
    const connectionDomain = "newConnection"
    const accountId = "456"
    const domain = "test.com"
    const setItemSpy = jest
      .spyOn(Object.getPrototypeOf(window.localStorage), "setItem")
      .mockImplementation(() => ({}))
    const getItemSpy = jest
      .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
      .mockReturnValue(JSON.stringify(cache))

    createConnection({ connectionDomain, accountId, domain })

    expect(setItemSpy).toHaveBeenCalledTimes(1)
    expect(setItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify({
        ...cache,
        [connectionDomain]: { accountId, domain },
      }),
    )
    expect(getItemSpy).toHaveBeenCalledTimes(1)
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it("should read an existing connection from local storage", () => {
    const cache = {
      existingConnection: { accountId: "123", domain: "example.com" },
    }
    const connectionDomain = "existingConnection"
    const getItemSpy = jest
      .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
      .mockReturnValue(JSON.stringify(cache))

    const result = readConnection({ connectionDomain })

    expect(result).toEqual(cache[connectionDomain])
    expect(getItemSpy).toHaveBeenCalledTimes(1)
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it("should return undefined for a non-existing connection", () => {
    const cache = {
      existingConnection: { accountId: "123", domain: "example.com" },
    }
    const connectionDomain = "nonExistingConnection"
    const getItemSpy = jest
      .spyOn(Object.getPrototypeOf(window.localStorage), "getItem")
      .mockReturnValue(JSON.stringify(cache))

    const result = readConnection({ connectionDomain })

    expect(result).toBeUndefined()
    expect(getItemSpy).toHaveBeenCalledTimes(1)
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })
})
