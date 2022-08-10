/**
 * @jest-environment jsdom
 */
import { interpret } from "xstate"

import { Profile } from "frontend/integration/identity-manager"
import { factoryProfile } from "frontend/integration/identity-manager/__mocks"

// import { factoryProfile } from "frontend/integration/identity-manager/__mocks"
import KnownDeviceMachine from "./known-device"

const mockLocalStorage = {
  ...window.localStorage,
  getItem: () => JSON.stringify(factoryProfile()),
}
jest
  .spyOn(window, "localStorage", "get")
  .mockImplementation(() => mockLocalStorage)

describe("KnownDevice machine", () => {
  it("should transition to Authenticate state", (done) => {
    const fetchAuthenticatorDevicesService = jest.fn(() => Promise.resolve([]))
    const fetchProfileService = jest.fn(() => Promise.resolve([]))
    const fetchAccountLimitService = jest.fn(() => Promise.resolve(1))
    const loginService = jest.fn(() => Promise.resolve())
    const getLocalStorageProfileService = jest.fn(() =>
      Promise.resolve({
        anchor: 123,
      } as Profile),
    )
    const assignDevices = jest.fn()
    const assignProfile = jest.fn()
    const assignAccountLimit = jest.fn()
    const mockKnownDeviceMachine = KnownDeviceMachine.withConfig({
      services: {
        fetchAuthenticatorDevicesService,
        fetchAccountLimitService,
        getLocalStorageProfileService,
      },
      actions: {
        assignProfile,
        assignDevices,
        assignAccountLimit,
      },
      guards: {
        isSingleAccountApplication: () => false,
      },
    })
    const fetchApplicationConfigService = interpret(
      mockKnownDeviceMachine,
    ).onTransition((state) => {
      if (state.matches("Start")) {
        expect(getLocalStorageProfileService).toHaveBeenCalled()
      }
      if (state.matches("Start.FetchDevices")) {
        expect(fetchAuthenticatorDevicesService).toHaveBeenCalled()
      }
      if (state.matches("Start.FetchAccountLimit")) {
        expect(assignProfile).toHaveBeenCalled()
        const context = state.children.profile
        console.log(state.event)
      }
      if (state.matches("Authenticate")) {
        expect(assignDevices).toHaveBeenCalled()
        done()
      }
      //todo UNLOCK
      if (state.matches("Login")) {
        expect(loginService).toHaveBeenCalled()
        done()
      }
      if (state.matches("UpdateProfile")) {
        expect(fetchProfileService).toHaveBeenCalled()
        done()
      }
    })
    fetchApplicationConfigService.start()
  })
})

export {}
