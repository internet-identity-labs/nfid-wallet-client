/**
 * @jest-environment jsdom
 */
import { interpret } from "xstate"

import KnownDeviceMachine from "./known-device"

describe("KnownDevice machine", () => {
  it("should transition to Authenticate state", (done) => {
    const fetchDevices = jest.fn(() => Promise.resolve())
    const assignDevices = jest.fn()
    const mockKnownDeviceMachine = KnownDeviceMachine.withConfig({
      services: {
        fetchDevices,
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
        expect(fetchDevices).toHaveBeenCalled()
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
