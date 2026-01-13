import { targetService } from "./target.service"

describe("Target service test suite", () => {
  jest.setTimeout(50000)

  it("should fail on empty targets", async () => {
    const targets: string[] = []
    const origin = ""

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: false,
      details: {
        icrc28Verified: false,
      },
    })
  })

  it("should fail on undefined targets", async () => {
    const targets: string[] = undefined as unknown as string[]
    const origin = ""

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: false,
      details: {
        icrc28Verified: false,
      },
    })
  })

  it("should succeed", async () => {
    const targets: string[] = ["do25a-dyaaa-aaaak-qifua-cai"]
    const origin = "http://localhost:3001"

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: true,
      details: {
        icrc28Verified: true,
      },
    })
  })

  it("should fail on no icrc10_supported_standards method", async () => {
    const targets: string[] = ["74gpt-tiaaa-aaaak-aacaa-cai"]
    const origin = "http://localhost:3001"

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: false,
      details: {
        icrc28Verified: false,
      },
    })
  })

  it("should fail on no icrc1 in icrc10_supported_standards method", async () => {
    const targets: string[] = ["grvap-eyaaa-aaaao-qjxba-cai"]
    const origin = "http://localhost:3001"

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: true,
      details: {
        icrc28Verified: true,
      },
    })
  })

  it("should fail on no icrc7 in icrc10_supported_standards method", async () => {
    const targets: string[] = ["klcvg-qyaaa-aaaaj-qngma-cai"]
    const origin = "http://localhost:3001"

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: true,
      details: {
        icrc28Verified: true,
      },
    })
  })

  it("should fail on EXT validation as the canister has balance and tranfer methods", async () => {
    const targets: string[] = ["zjrr6-cqaaa-aaaam-ad3ia-cai"]
    const origin = "http://localhost:3001"

    const result = await targetService.getVerificationReport(targets, origin)

    expect(result).toEqual({
      isPublicAccountAvailable: true,
      details: {
        icrc28Verified: true,
      },
    })
  })
})
