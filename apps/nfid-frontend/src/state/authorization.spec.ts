/**
 * @jest-environment jsdom
 */
import { getScope } from "./authorization"

describe("internet identity integration layer", () => {
  it("does not include a persona salt for the zero persona", () => {
    expect(getScope("http://test.com", 0)).toBe("http://test.com")
  })
  it("includes persona salt for a 1+ persona", () => {
    expect(getScope("https://test.com", 1)).toBe("1@https://test.com")
  })
  it("adds https:// if no protocol was present", () => {
    expect(getScope("test.com", 0)).toBe("https://test.com")
    expect(getScope("test.com", 2)).toBe("2@https://test.com")
  })
  it("uses derivationOrigin if present", () => {
    expect(getScope("test.com", 0, "my-other-domain.com")).toBe(
      "https://my-other-domain.com",
    )
  })
})
