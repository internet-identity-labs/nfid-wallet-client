import { II_DEVICES_DATA } from "./internet-identity/__mocks"

export const mockResolver = (resolve: () => void, reject: () => void) => {
  return new Promise((resolve, reject) => {})
}

export const iiLookupMock = () => Promise.resolve(II_DEVICES_DATA)

export const iiCreateChallengeMock = () =>
  Promise.resolve({
    png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    challenge_key: "challenge_key",
  })
