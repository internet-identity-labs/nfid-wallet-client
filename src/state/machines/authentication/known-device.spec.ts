/**
 * @jest-environment jsdom
 */
import { interpret } from "xstate"

import KnownDeviceMachine from "./known-device"

describe("KnownDevice machine", () => {
  it("should transition to Authenticate state", (done) => {
    const fetchAuthenticatorDevicesService = jest.fn(() => Promise.resolve())
    const fetchAccountLimitService = jest.fn(() => Promise.resolve())
    const assignDevices = jest.fn()
    const mockKnownDeviceMachine = KnownDeviceMachine.withConfig({
      services: {
        // @ts-ignore
        fetchAuthenticatorDevicesService,
        fetchAccountLimitService,
      },
      actions: {
        assignDevices,
      },
      guards: {
        isSingleAccountApplication: () => false,
      },
    })
    const fetchApplicationConfigService = interpret(
      mockKnownDeviceMachine,
    ).onTransition((state) => {
      if (state.matches("Start")) {
        expect(fetchAuthenticatorDevicesService).toHaveBeenCalled()
        expect(fetchAccountLimitService).toHaveBeenCalled()
      }
      if (state.matches("Authenticate")) {
        expect(assignDevices).toHaveBeenCalled()
        done()
      }
    })
    fetchApplicationConfigService.start()
  })
})

export {}
