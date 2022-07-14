/**
 * @jest-environment jsdom
 */
import { render, waitFor, screen } from "@testing-library/react"
import { spawn } from "xstate"

import KnownDeviceMachine, {
  KnownDeviceActor,
} from "frontend/state/machines/authentication/known-device"

import { KnownDeviceCoordinator } from "../known-device"

describe("KnownDevice Coordinator", () => {
  it("should render", async () => {
    const testMachine = KnownDeviceMachine.withConfig({
      guards: {
        isDeviceRegistered() {
          return true
        },
      },
    })

    render(<KnownDeviceCoordinator actor={spawn(testMachine)} />)
    await waitFor(() => screen.getByText("KnownDeviceCoordinator"))
    expect(screen.getByText("KnownDeviceCoordinator")).toBeDefined()
  })
})
