/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"
import { SWRConfig } from "swr"

import * as facadeMocks from "frontend/integration/facade/wallet"
import { factoryDelegationIdentity } from "frontend/integration/identity/__mocks"

import { useWalletDelegation } from "./use-wallet-delegation"

describe("useWalletDeletation", () => {
  // NOTE: this is required in order to isolate the swr cache per test run
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  )
  const getWalletDelegationSpy = jest
    .spyOn(facadeMocks, "getWalletDelegation")
    .mockImplementation(factoryDelegationIdentity)

  const setup = (
    initialProps: {
      userNumber?: number
      hostName?: string
      personaId?: string
    } = {},
  ) => {
    return renderHook(
      ({ userNumber, hostName, personaId }) => {
        return useWalletDelegation(userNumber, hostName, personaId)
      },
      {
        initialProps,
        wrapper,
      },
    )
  }

  it("should not call getWalletDelegation without userNumber", () => {
    setup()
    expect(getWalletDelegationSpy).not.toHaveBeenCalled()
  })

  it("should call getWalletDelegation once per arg set", async () => {
    const { rerender } = setup({ userNumber: 10000 })

    // FIXME:
    expect(getWalletDelegationSpy).toHaveBeenCalledWith(
      10000,
      undefined,
      undefined,
    )

    for (let i = 0; i < 5; i++) {
      const userNumber = 10000
      const hostName = `https://my-host-${i}.com`
      const personaId = `${i}`

      rerender({
        userNumber,
        hostName,
        personaId,
      })
      expect(getWalletDelegationSpy).toHaveBeenCalledWith(
        10000,
        hostName,
        personaId,
      )
    }
    expect(getWalletDelegationSpy).toHaveBeenCalledTimes(6)

    rerender({ userNumber: 10000 })

    expect(getWalletDelegationSpy).toHaveBeenCalledTimes(6)
  })
})
