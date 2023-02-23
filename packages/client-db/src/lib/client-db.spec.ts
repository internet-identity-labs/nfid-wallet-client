import { clientDb } from "./client-db"

describe("clientDb", () => {
  it("should work", () => {
    expect(clientDb()).toEqual("client-db")
  })
})
