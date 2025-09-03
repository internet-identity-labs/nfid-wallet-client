import * as jose from "jose"
import * as JwtService from "jsonwebtoken"

import {
  PrevTokenHasNotExpiredError,
  VerificationIsInProgressError,
  generateCryptoKeyPair,
  verificationService,
} from "./verification.service"

const testEmail = "testEmailAddress"
const token = "token"
const userPublicKey = `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAIH/ILWSkFYKvy3ga28KUu88yLJPFYSbLNy2ekY33LfK9lTd24RL6b3n/xH9RbaOhP8EwG1+VhqmEGKUajx3XkrwBZKg9pSS8ajodxjXNXbDwQaE9PpV6ZN9S925TrVBGH+9zuFyWdfPNMAUoMR/xGl7LQ3I10Wfr7ZhqCpVwU3nBgIU=
-----END PUBLIC KEY-----`
const userPrivateKey = `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAF3G7uAQrT1lszy1r6Jo2aARbWemHWzW0LmB99HPiKoHZd2mX+vlupCLPwnyrvhf8NLOmE/bQ2y9yv7YWarePUyOhgYkDgYYABAAgf8gtZKQVgq/LeBrbwpS7zzIsk8VhJss3LZ6Rjfct8r2VN3bhEvpvef/Ef1Fto6E/wTAbX5WGqYQYpRqPHdeSvAFkqD2lJLxqOh3GNc1dsPBBoT0+lXpk31L3blOtUEYf73O4XJZ1880wBSgxH/EaXstDcjXRZ+vtmGoKlXBTecGAhQ==
-----END PRIVATE KEY-----`
const keyPair = {
  publicKey: userPublicKey,
  privateKey: userPrivateKey,
}

describe("Verification of email", () => {
  beforeEach(() => {
    jest.resetModules() // Resets the module registry before each test
  })

  it("should validate contract between jose and jsonwebtoken libs.", async () => {
    const keyPair = await generateCryptoKeyPair()
    const privateKey = await jose.importPKCS8(keyPair.privateKey, "ES512")

    const token = await new jose.SignJWT({ nonce: "0" })
      .setProtectedHeader({ alg: "ES512" })
      .setIssuer("https://nfid.one")
      .setSubject(testEmail)
      .setAudience("https://nfid.one")
      .setJti("requestId")
      .sign(privateKey)

    JwtService.verify(token, keyPair.publicKey, {
      algorithms: ["ES512"],
      audience: "https://nfid.one",
      issuer: "https://nfid.one",
      subject: testEmail,
      nonce: "0",
      jwtid: "requestId",
    })
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
    const delegationChain = {
      delegationChain: {
        delegations: [
          {
            delegation: {
              expiration: "176eea29a49fa7c0",
              pubkey:
                "302a300506032b6570032100f0a5aa9e01e34f93c637b137196b8c8bbf696472bfe3f54da61a7be4e24434cf",
            },
            signature:
              "d23be27018f38620473b8d1a5b3d7a6b0bfb1864ca07d1ae4c80903e41fad6304f25ea43bb93370a324d3b7b056887224efd12b44214f0724d49dd648e95ac0e",
          },
        ],
        publicKey:
          "302a300506032b6570032100f8a284f5c22a5d3687a5bb22c4cc92ab3dc39f4bb896183642f8798c5d6d2cd0",
      },
    }
    const mockFetchPromise = Promise.resolve({
      text: () => JSON.stringify(delegationChain),
      ok: true,
    })

    global.fetch = jest.fn().mockImplementation((url, options) => {
      validateCheckVerificationRequest(url, options)
      return mockFetchPromise
    })

    const { delegation } = await verificationService.checkVerification(
      "email",
      testEmail,
      keyPair,
      "requestId",
      0,
    )

    expect(delegation.getPrincipal().toString()).toEqual(
      "reg26-wntni-wohfr-joo32-yiiep-pndnq-jocjn-oqpdg-yzqnm-afsbg-uqe",
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
      status: 202,
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
    "https://m81pwzeyke.execute-api.us-east-1.amazonaws.com/dev/send_verification_email",
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
    "https://m81pwzeyke.execute-api.us-east-1.amazonaws.com/dev/verify_email",
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
    "https://m81pwzeyke.execute-api.us-east-1.amazonaws.com/dev/check_verification",
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
