import { getScope } from "./get-scope"

describe("getScope", () => {
  it("does not include a persona salt for the zero persona", () => {
    expect(getScope("https://test.com", "0")).toBe("https://test.com")
  })
  it("does not include a persona salt for a null persona", () => {
    expect(getScope("https://test.com")).toBe("https://test.com")
  })
  it("includes persona salt for a 1+ persona", () => {
    expect(getScope("https://test.com", "1")).toBe("1@https://test.com")
  })
  it("adds https protocol if no protocol is present", () => {
    expect(getScope("test.com", "1")).toBe("1@https://test.com")
  })
  it("does not add https protocol if domain is nfid.one", () => {
    expect(getScope("nfid.one", "0")).toBe("nfid.one")
  })
})
