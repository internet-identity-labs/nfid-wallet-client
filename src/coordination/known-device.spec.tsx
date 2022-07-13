/**
 * @jest-environment jsdom
 */
import { render, waitFor, screen } from "@testing-library/react"

import KnownDeviceMachine, {
  KnownDeviceActor,
} from "frontend/state/authentication/known-device"

import { KnownDeviceCoordinator } from "./known-device"

describe("KnownDevice Coordinator", () => {
  it("should render", async () => {
    const testMachine = KnownDeviceMachine.withConfig({
      guards: {
        isDeviceRegistered() {
          return true
        },
      },
    })
    render(<KnownDeviceCoordinator actor={testMachine as KnownDeviceActor} />)
    await waitFor(() => screen.getByText("Start"))
    expect(screen.getByText("Start")).toBeDefined()
  })
})
