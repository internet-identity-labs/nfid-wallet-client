/**
 * @jest-environment jsdom
 */
import {
  MAX_ALTERNATIVE_ORIGINS,
  validateDerivationOrigin,
} from "./validateDerivationOrigin"

const mockAliasDomain = "http://localhost:8080"
const mockRequestDerivationOrigin =
  "https://rrkah-fqaaa-aaaaa-aaaaq-cai.ic0.app"

const mockDerivationOrigin = "https://rrkah-fqaaa-aaaaa-aaaaq-cai.ic0.app"
const mockDerivationInvalidOrigin = "https://rrkah-fqaaa-aaaaa-aaaaq-cai"

describe("validate derivation origin test suite", () => {
  it("should return valid when requestOrigin included in alternativeOrigins", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ alternativeOrigins: [mockAliasDomain] }),
      }),
    ) as jest.Mock
    const response = await validateDerivationOrigin(
      mockAliasDomain,
      mockDerivationOrigin,
    )

    expect(response.result).toBe("valid")
  })

  it("should return invalid when requestOrigin not included in alternativeOrigins", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ alternativeOrigins: [] }),
      }),
    ) as jest.Mock
    const response = await validateDerivationOrigin(
      mockAliasDomain,
      mockDerivationOrigin,
    )

    expect(response.result).toBe("invalid")
  })

  it("should return invalid when alternativeOrigns array contains more than 10 entries", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            alternativeOrigins: new Array(11).map(
              () => mockDerivationInvalidOrigin,
            ),
          }),
      }),
    ) as jest.Mock
    const response = await validateDerivationOrigin(
      mockAliasDomain,
      mockDerivationOrigin,
    )

    expect(response).toEqual({
      result: "invalid",
      message: `Resource https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/fetch-alternative-origins/rrkah-fqaaa-aaaaa-aaaaq-cai has too many entries: To prevent misuse at most ${MAX_ALTERNATIVE_ORIGINS} alternative origins are allowed.`,
    })
  })

  it("wrong regex should return invalid", async () => {
    const response = await validateDerivationOrigin(
      mockAliasDomain,
      mockDerivationInvalidOrigin,
    )

    expect(response.result).toBe("invalid")
  })

  it("undefined derivationOrigin should valid", async () => {
    const response = await validateDerivationOrigin(mockAliasDomain)

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
