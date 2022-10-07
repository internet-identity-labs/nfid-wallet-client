/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"
import React from "react"
import { SWRConfig, useSWRConfig } from "swr"

import * as facadeMocks from "frontend/integration/facade/wallet"

import { factoryDelegationIdentity } from "../identity/__mocks"
import { useWalletDelegation } from "./hooks"

beforeEach(() => {
  jest.resetAllMocks()
})

describe("wallet hooks", () => {
  describe("useWalletDeletation", () => {
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
      // NOTE: this is required in order to isolate the swr cache per test run
      const wrapper = ({ children }: { children: React.ReactElement }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      )
      const result = renderHook(
        ({ userNumber, hostName, personaId }) => {
          return useWalletDelegation(userNumber, hostName, personaId)
        },
        {
          initialProps,
          wrapper,
        },
      )
      return { ...result }
    }

    it("should not call getWalletDelegation without userNumber", () => {
      setup()
      expect(getWalletDelegationSpy).not.toHaveBeenCalled()
    })
    it("should call getWalletDelegation only once", () => {
      const { rerender } = setup({ userNumber: 10000 })
      for (let i = 0; i < 5; i++) {
        rerender({ userNumber: 10000 })
      }
      expect(getWalletDelegationSpy).toHaveBeenCalledTimes(1)
    })
    it("should call getWalletDelegation once per arg set", async () => {
      jest.useFakeTimers()

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
})
