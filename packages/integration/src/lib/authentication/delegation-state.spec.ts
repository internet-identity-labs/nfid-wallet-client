import { DelegationIdentity } from "@dfinity/identity"

import * as delegationByScope from "../internet-identity/get-delegation-by-scope"
import { delegationState } from "./delegation-state"

const makeGetDelegationByScopeMock = () => {
  const mockedDelegationIdentity = {
    getDelegation: () => ({
      delegations: [{ delegation: { expiration: BigInt(100000) } }],
    }),
  } as DelegationIdentity
  const mockDelegationByScope = jest
    .spyOn(delegationByScope, "delegationByScope")
    .mockImplementation(() => Promise.resolve(mockedDelegationIdentity))

  return { mockDelegationByScope, mockedDelegationIdentity }
}

describe("createDelegationState", () => {
  const anchor = 123
  const scope = "some-scope"
  const maxTimeToLive = BigInt(100000)

  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.clearAllMocks()
  })

  it("should return a DelegationIdentity", async () => {
    const { mockDelegationByScope, mockedDelegationIdentity } =
      makeGetDelegationByScopeMock()
    const delegation = await delegationState.getDelegation(
      anchor,
      scope,
      maxTimeToLive,
    )
    expect(delegation).toEqual(mockedDelegationIdentity)
    expect(mockDelegationByScope).toHaveBeenCalled()
  })

  it("should cache delegation for the same anchor and scope", async () => {
    const { mockDelegationByScope } = makeGetDelegationByScopeMock()

    const delegation1 = await delegationState.getDelegation(
      anchor,
      scope,
      maxTimeToLive,
    )
    const delegation2 = await delegationState.getDelegation(
      anchor,
      scope,
      maxTimeToLive,
    )
    expect(mockDelegationByScope).toHaveBeenCalledTimes(1) // delegationByScope should have been called only once
    expect(delegation1).toBe(delegation2) // The same delegation object should be returned both times
  })

  it("should refresh delegation before it expires", async () => {
    const expiresIn = 6000
    const { mockDelegationByScope } = makeGetDelegationByScopeMock()

    delegationState.getDelegation(anchor, scope, maxTimeToLive)
    await Promise.resolve() // Wait for promises to resolve
    expect(mockDelegationByScope).toHaveBeenCalledTimes(1) // delegationByScope should have been called once when the promise is created
    expect(mockDelegationByScope).toHaveBeenCalledWith(
      anchor,
      scope,
      maxTimeToLive,
    )
    jest.advanceTimersByTime(expiresIn)
    await Promise.resolve() // Wait for promises to resolve
    expect(mockDelegationByScope).toHaveBeenCalledTimes(2) // delegationByScope should have been called again after the expiration time
    expect(mockDelegationByScope).toHaveBeenCalledWith(
      anchor,
      scope,
      maxTimeToLive,
    )
  })
})
