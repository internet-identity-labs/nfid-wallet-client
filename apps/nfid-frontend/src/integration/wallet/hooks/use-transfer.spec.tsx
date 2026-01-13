/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react"
import { SWRConfig } from "swr"

import { Profile } from "@nfid/integration"
import { transfer } from "@nfid/integration/token/icp"

import * as facadeMocks from "frontend/integration/facade/wallet"
import { factoryDelegationIdentity } from "frontend/integration/identity/__mocks"
import * as imQueryMocks from "frontend/integration/identity-manager/queries"

import { stringICPtoE8s } from "../utils"

import { useTransfer } from "./use-transfer"

import { TokenTransferConfig } from "."

jest.mock("@nfid/integration/token/icp")

beforeEach(() => {
  jest.resetAllMocks()
})

describe("useTransfer", () => {
  // NOTE: this is required in order to isolate the swr cache per test run
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  )
  const setup = (
    initialProps: TokenTransferConfig = { transformAmount: stringICPtoE8s },
  ) => {
    return renderHook(
      ({ domain, accountId, transformAmount }: TokenTransferConfig) => {
        return useTransfer({
          domain,
          accountId,
          transformAmount,
        })
      },
      {
        initialProps,
        wrapper,
      },
    )
  }
  it("should delay transfer call until wallet delegation ready", async () => {
    const getWalletDelegationP = Promise.resolve(factoryDelegationIdentity())
    const useProfile = jest
      .spyOn(imQueryMocks, "useProfile")
      .mockImplementation(() => ({
        isLoading: false,
        refreshProfile: jest.fn(),
        profile: { anchor: 10000 } as Profile,
      }))

    const getWalletDelegationSpy = jest
      .spyOn(facadeMocks, "getWalletDelegation")
      .mockImplementation(() => getWalletDelegationP)

    const transferP = Promise.resolve(BigInt(1))
    const transferSpy = (transfer as jest.Mock).mockImplementation(
      () => transferP,
    )

    // Initial setup of useTransfer hook
    const { result } = setup()

    expect(useProfile).toHaveBeenCalled()
    expect(getWalletDelegationSpy).toHaveBeenCalled()
    expect(result.current.isValidatingWalletDelegation).toBe(true)

    const transferPromise = result.current.transfer("test", "10")

    expect(transferSpy).not.toHaveBeenCalled()

    // // Simulating the resolving promise for the walletDelegation
    await act(async () => {
      await getWalletDelegationP
    })

    // // checking final state
    expect(result.current.isValidatingWalletDelegation).toBe(false)
    expect(transferSpy).toHaveBeenCalledWith({
      amount: 1000000000,
      to: "test",
      identity: expect.anything(),
    })
    expect(transferPromise).resolves.toBe(BigInt(1))
  })
  it("should throw when calling transfer while pending", async () => {
    const getWalletDelegationP = Promise.resolve(factoryDelegationIdentity())

    jest.spyOn(imQueryMocks, "useProfile").mockImplementation(() => ({
      isLoading: false,
      refreshProfile: jest.fn(),
      profile: { anchor: 10000 } as Profile,
    }))

    const getWalletDelegationSpy = jest
      .spyOn(facadeMocks, "getWalletDelegation")
      .mockImplementation(() => getWalletDelegationP)

    const transferP = Promise.resolve(BigInt(1))
    const transferSpy = (transfer as jest.Mock).mockImplementation(
      () => transferP,
    )

    // Initial setup of useTransfer hook
    const { rerender, result } = setup()

    const transferPromise = result.current.transfer("test", "10")

    rerender({
      domain: "test",
      accountId: "0",
      transformAmount: stringICPtoE8s,
    })
    expect(transferPromise).rejects.toBe("domain or accountId has been changed")
    expect(transferSpy).not.toHaveBeenCalled()
    expect(getWalletDelegationSpy).toHaveBeenCalledTimes(2)

    const transferPromise2 = result.current.transfer("test-2", "20")

    await act(async () => {
      await getWalletDelegationP
    })
    expect(transferPromise2).resolves.toBe(BigInt(1))
    expect(transferSpy).toHaveBeenCalledWith({
      amount: 2000000000,
      to: "test-2",
      identity: expect.anything(),
    })
  })
})
