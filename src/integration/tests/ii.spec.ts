import { scopeString } from "../actors/ii"

describe("internet identity integration layer", () => {
  it("does not include a persona salt for the zero persona", () => {
    expect(scopeString("test.com", 0)).toBe("test.com")
  })
  it("does not include a persona salt for a null persona", () => {
    expect(scopeString("test.com")).toBe("test.com")
  })
  it("includes persona salt for a 1+ persona", () => {
    expect(scopeString("test.com", 1)).toBe("1@test.com")
  })
})
