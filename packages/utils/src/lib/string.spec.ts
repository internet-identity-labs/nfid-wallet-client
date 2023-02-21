import { truncateString } from "./string"

describe("truncateString", () => {
  it("truncates the string to the specified maximum length and adds '...' at the end", () => {
    const originalString = "This is a very long string"
    const truncatedString = truncateString(originalString, 20)
    expect(truncatedString).toBe("This is a very long ...")
  })

  it("does not modify the string if its length is already less than or equal to the maximum length", () => {
    const originalString = "Short string"
    const truncatedString = truncateString(originalString, 20)
    expect(truncatedString).toBe(originalString)
  })
})
