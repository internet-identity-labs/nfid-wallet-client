export const mockResolver = (resolve: () => void, reject: () => void) => {
  return new Promise((resolve, reject) => {})
}

export const iiCreateChallengeMock = () =>
  Promise.resolve({
    png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    challenge_key: "challenge_key",
  })
