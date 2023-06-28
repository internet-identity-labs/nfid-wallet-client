import {
  PrevTokenHasNotExpiredError,
  VerificationIsInProgressError,
  verificationService,
} from "./verification.service"

const testEmail = "testEmailAddress"
const token = "token"
const userPublicKey = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAgbZCKZ0r0nhhLzdgJoh8vy4sST2j
7kSWJsOk6GWK6rJ2LiiQccv8SKhgN+B/xUvdnxEBCwiMPnJ5kDuFURaQXBcAoPvx
jHGlKn1c6J2SoX3jiDnkSaX0HPag6feS1LU4M+mQCgBR3ZMhk0kT8myOa7lpYi4V
6/2raN6Dk8ARTPYCnWs=
-----END PUBLIC KEY-----`
const userPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MIHcAgEBBEIAqnqsS3S9k6LRXBfRelSw0EkidOuRMrC675Lol+GJc5qvYbvYW4Le
OPIXYCEuoghCeiji/4zq60Xeghb34IbO46KgBwYFK4EEACOhgYkDgYYABACBtkIp
nSvSeGEvN2AmiHy/LixJPaPuRJYmw6ToZYrqsnYuKJBxy/xIqGA34H/FS92fEQEL
CIw+cnmQO4VRFpBcFwCg+/GMcaUqfVzonZKhfeOIOeRJpfQc9qDp95LUtTgz6ZAK
AFHdkyGTSRPybI5ruWliLhXr/ato3oOTwBFM9gKdaw==
-----END EC PRIVATE KEY-----`
const keyPair = {
  publicKey: userPublicKey,
  privateKey: userPrivateKey,
}

describe("Verification of email", () => {
  beforeEach(() => {
    jest.resetModules() // Resets the module registry before each test
  })

  it("should exec sendVerification and receive success response", async () => {
    let publicKey = ""
    const requestId = "requestId"
    const mockFetchPromise = Promise.resolve({
      text: () => JSON.stringify({ requestId }),
      ok: true,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      publicKey = validateVerificationRequest(url, options)
      return mockFetchPromise
    })

    const result = await verificationService.sendVerification({
      verificationMethod: "email",
      emailAddress: testEmail,
    })

    expect(result).toMatchObject({
      requestId,
      keyPair: {
        publicKey,
        privateKey: expect.any(String),
      },
    })
  })

  it("should exec sendVerification and receive general error response", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 400,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateVerificationRequest(url, options)
      return mockFetchPromise
    })

    const func = verificationService.sendVerification({
      verificationMethod: "email",
      emailAddress: "testEmailAddress",
    })

    await expect(func).rejects.toThrow(errorText)
  })

  it("should exec sendVerification and receive PrevTokenHasNotExpiredError error", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 429,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateVerificationRequest(url, options)
      return mockFetchPromise
    })

    const func = verificationService.sendVerification({
      verificationMethod: "email",
      emailAddress: "testEmailAddress",
    })

    await expect(func).rejects.toThrow(PrevTokenHasNotExpiredError)
  })

  it("should exec verify and receive success response", async () => {
    const mockFetchPromise = Promise.resolve({
      ok: true,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateVerifyRequest(url, options)
      return mockFetchPromise
    })

    const result = await verificationService.verify("email", token)
    expect(result).toEqual("success")
  })

  it("should exec verify and receive general error response", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 401,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateVerifyRequest(url, options)
      return mockFetchPromise
    })

    const func = verificationService.verify("email", token)
    await expect(func).rejects.toThrow(errorText)
  })

  it("should exec verify and receive invalid token error response", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 400,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateVerifyRequest(url, options)
      return mockFetchPromise
    })

    const result = await verificationService.verify("email", token)
    expect(result).toEqual("invalid-token")
  })

  it("should exec checkVerification and receive success response", async () => {
    const sessionKeyAndDelegationChain = {
      delegation: JSON.stringify({
        sessionKey: [
          "302a300506032b6570032100e35758ad5ef3e445ad5e68bdb7edf084a948fa66077f16ab377149a4c0ccc0f8",
          "8015be7438299df91dcd9f9c773f2bfca034b9a9a45647305ebccde34f08c335e35758ad5ef3e445ad5e68bdb7edf084a948fa66077f16ab377149a4c0ccc0f8",
        ],
        chain: {
          delegations: [
            {
              delegation: {
                expiration: "176ce4113d4b10c0",
                pubkey:
                  "302a300506032b6570032100e35758ad5ef3e445ad5e68bdb7edf084a948fa66077f16ab377149a4c0ccc0f8",
              },
              signature:
                "87390e5fb985d091f0ce8fc58c57a4a21a73486e30f84b7d36f1192f07e69d99252954c5d1a15717d3db6aeeacc9f3af0808a7646614452014dee1829c849501",
            },
          ],
          publicKey:
            "302a300506032b65700321002ec65e4e583e53d3750bb0d3bdc5c7c529c02dbfa1b2ac5a58bce4eb327edc7f",
        },
      }),
    }
    const mockFetchPromise = Promise.resolve({
      text: () => JSON.stringify(sessionKeyAndDelegationChain),
      ok: true,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateCheckVerificationRequest(url, options)
      return mockFetchPromise
    })

    const delegationIdentity = await verificationService.checkVerification(
      "email",
      testEmail,
      keyPair,
      "requestId",
      0,
    )

    expect(delegationIdentity.getPrincipal().toString()).toEqual(
      "3n7dj-gk5yn-hh4ka-xqp43-bz7sg-eysrq-vyoje-ljtyh-5wqma-5f4h5-mqe",
    )
  })

  it("should exec checkVerification and receive general error response", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 400,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateCheckVerificationRequest(url, options)
      return mockFetchPromise
    })

    const func = verificationService.checkVerification(
      "email",
      testEmail,
      keyPair,
      "requestId",
      0,
    )
    await expect(func).rejects.toThrow(errorText)
  })

  it("should exec checkVerification and receive VerificationIsInProgressError error", async () => {
    const errorText = "errorText"
    const mockFetchPromise = Promise.resolve({
      text: () => errorText,
      ok: false,
      status: 423,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateCheckVerificationRequest(url, options)
      return mockFetchPromise
    })

    const func = verificationService.checkVerification(
      "email",
      testEmail,
      keyPair,
      "requestId",
      0,
    )
    await expect(func).rejects.toThrow(VerificationIsInProgressError)
  })
})

function validateVerificationRequest(url: string, options: any): string {
  expect(url).toEqual(
    "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/send_verification_email",
  )
  expect(options).toMatchObject({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const body = JSON.parse(options.body)
  expect(body).toMatchObject({
    email: testEmail,
    publicKey: expect.any(String),
  })
  return body.publicKey
}

function validateVerifyRequest(url: string, options: any): void {
  expect(url).toEqual(
    "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/verify_email",
  )
  expect(options).toMatchObject({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const body = JSON.parse(options.body)
  expect(body).toMatchObject({
    token: token,
  })
}

function validateCheckVerificationRequest(url: string, options: any): void {
  expect(url).toEqual(
    "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/check_verification",
  )
  expect(options).toMatchObject({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const body = JSON.parse(options.body)
  expect(body).toMatchObject({
    token: expect.any(String),
  })
}
