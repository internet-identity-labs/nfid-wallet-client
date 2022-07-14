import { validateDerivationOrigin } from "./validateDerivationOrigin"

const mockRequestOrigin = "http://localhost:8080"
const mockRequestDerivationOrigin =
  "https://rrkah-fqaaa-aaaaa-aaaaq-cai.ic0.app"

const mockDerivationOrigin = "https://rrkah-fqaaa-aaaaa-aaaaq-cai.ic0.app"
const mockDerivationInvalidOrigin = "https://rrkah-fqaaa-aaaaa-aaaaq-cai"

describe("validate derivation origin test suite", () => {
  it("correct mockData should return invalid", async () => {
    // Can't mock request
    const response = await validateDerivationOrigin(
      mockRequestOrigin,
      mockDerivationOrigin,
    )
    expect(response.result).toBe("invalid")
  })

  it("wrong regex should return invalid", async () => {
    const response = await validateDerivationOrigin(
      mockRequestOrigin,
      mockDerivationInvalidOrigin,
    )

    expect(response.result).toBe("invalid")
  })

  it("undefined derivationOrigin should valid", async () => {
    const response = await validateDerivationOrigin(mockRequestOrigin)

    expect(response.result).toBe("valid")
  })

  it("same request origin and derivation origin should return valid", async () => {
    const response = await validateDerivationOrigin(
      mockRequestDerivationOrigin,
      mockDerivationOrigin,
    )

    expect(response.result).toBe("valid")
  })
})

export {}
