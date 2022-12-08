/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react"
import { SWRConfig } from "swr"

import { Profile, transfer } from "@nfid/integration"

import * as facadeMocks from "frontend/integration/facade/wallet"
import * as imQueryMocks from "frontend/integration/identity-manager/queries"
import { factoryDelegationIdentity } from "frontend/integration/identity/__mocks"

import { TransferAccount } from "."
import { useTransfer } from "./use-transfer"

jest.mock("@nfid/integration")

beforeEach(() => {
  jest.resetAllMocks()
})

describe("useTransfer", () => {
  // NOTE: this is required in order to isolate the swr cache per test run
  const wrapper = ({ children }: { children: React.ReactElement }) => (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  )
  const setup = (initialProps: TransferAccount = {}) => {
    return renderHook(
      ({ domain, accountId }: TransferAccount = {}) => {
        return useTransfer({ domain, accountId })
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
    expect(transferSpy).toHaveBeenCalledWith(
      1000000000,
      "test",
      expect.anything(),
    )
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

    rerender({ domain: "test", accountId: "0" })
    expect(transferPromise).rejects.toBe("domain or accountId has been changed")
    expect(transferSpy).not.toHaveBeenCalled()
    expect(getWalletDelegationSpy).toHaveBeenCalledTimes(2)

    const transferPromise2 = result.current.transfer("test-2", "20")

    await act(async () => {
      await getWalletDelegationP
    })
    expect(transferPromise2).resolves.toBe(BigInt(1))
    expect(transferSpy).toHaveBeenCalledWith(
      2000000000,
      "test-2",
      expect.anything(),
    )
  })
})
