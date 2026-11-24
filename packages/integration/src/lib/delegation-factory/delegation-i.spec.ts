import { DelegationChain, DelegationIdentity } from "@icp-sdk/core/identity"

import { ONE_HOUR_IN_MS } from "@nfid/config"

import { authState } from "../authentication"
import { getAnonymousDelegationThroughLambda } from "../lambda/lambda-delegation"
import { getAnonymousDelegation } from "./delegation-i"
import { getDelegationChainSignedByCanister } from "./delegation-factory"

jest.mock("../actors", () => ({ im: {} }))
jest.mock("../../cache", () => ({ integrationCache: {} }))
jest.mock("../authentication", () => ({
  authState: { getUserIdData: jest.fn() },
}))
jest.mock("../lambda/domain-key-repository", () => ({
  DEFAULT_EXPIRAITON_TIME_MILLIS: 0,
  getFromStorage: jest.fn(),
  saveToStorage: jest.fn(),
}))
jest.mock("../lambda/lambda-delegation", () => ({
  fromHexString: jest.fn(),
  getAnonymousDelegationThroughLambda: jest.fn(),
  getLambdaPublicKey: jest.fn(),
  oldFlowDelegationChainLambda: jest.fn(),
  oldFlowGlobalKeysFromLambda: jest.fn(),
}))
jest.mock("../lambda/targets", () => ({ validateTargets: jest.fn() }))
jest.mock("./delegation-factory", () => ({
  getDelegationChainSignedByCanister: jest.fn(),
  getPrincipalSignedByCanister: jest.fn(),
}))

const mockedGetUserIdData = authState.getUserIdData as jest.Mock
const mockedCanisterDelegation = getDelegationChainSignedByCanister as jest.Mock
const mockedLambdaDelegation = getAnonymousDelegationThroughLambda as jest.Mock

const DOMAIN = "http://localhost:3002"
const SESSION_KEY = new Uint8Array([1, 2, 3])
const IDENTITY = {} as DelegationIdentity
const TARGETS = ["do25a-dyaaa-aaaak-qifua-cai"]
const CHAIN = {} as DelegationChain
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000

describe("getAnonymousDelegation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedCanisterDelegation.mockResolvedValue(CHAIN)
    mockedLambdaDelegation.mockResolvedValue(CHAIN)
  })

  it("should forward the requested maxTimeToLive to the delegation factory for canister anchors", async () => {
    // Given an account whose delegations are signed by the delegation factory
    mockedGetUserIdData.mockReturnValue({ anchor: BigInt(200_000_293) })

    // When an anonymous delegation is requested with a 30 minute lifetime
    const result = await getAnonymousDelegation(
      DOMAIN,
      SESSION_KEY,
      IDENTITY,
      THIRTY_MINUTES_IN_MS,
      TARGETS,
    )

    // Then the delegation factory is asked for exactly that lifetime
    expect(result).toBe(CHAIN)
    expect(mockedCanisterDelegation).toHaveBeenCalledWith(
      IDENTITY,
      TARGETS,
      SESSION_KEY,
      BigInt(200_000_293),
      DOMAIN,
      THIRTY_MINUTES_IN_MS,
    )
    expect(mockedLambdaDelegation).not.toHaveBeenCalled()
  })

  it("should forward the 2 hour default when no maxTimeToLive is passed for canister anchors", async () => {
    // Given an account whose delegations are signed by the delegation factory
    mockedGetUserIdData.mockReturnValue({ anchor: BigInt(200_000_293) })

    // When an anonymous delegation is requested without a lifetime
    await getAnonymousDelegation(DOMAIN, SESSION_KEY, IDENTITY)

    // Then the default 2 hour lifetime is forwarded
    expect(mockedCanisterDelegation).toHaveBeenCalledWith(
      IDENTITY,
      undefined,
      SESSION_KEY,
      BigInt(200_000_293),
      DOMAIN,
      ONE_HOUR_IN_MS * 2,
    )
  })

  it("should keep using the lambda flow with maxTimeToLive for legacy anchors", async () => {
    // Given a legacy account below the delegation factory threshold
    mockedGetUserIdData.mockReturnValue({ anchor: BigInt(10_974) })

    // When an anonymous delegation is requested with a 30 minute lifetime
    const result = await getAnonymousDelegation(
      DOMAIN,
      SESSION_KEY,
      IDENTITY,
      THIRTY_MINUTES_IN_MS,
      TARGETS,
    )

    // Then the lambda flow is used with the requested lifetime
    expect(result).toBe(CHAIN)
    expect(mockedLambdaDelegation).toHaveBeenCalledWith(
      DOMAIN,
      SESSION_KEY,
      IDENTITY,
      THIRTY_MINUTES_IN_MS,
      TARGETS,
    )
    expect(mockedCanisterDelegation).not.toHaveBeenCalled()
  })
})
