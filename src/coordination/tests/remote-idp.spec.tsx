/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react"

import RemoteSenderMachine from "frontend/state/machines/authentication/remote-sender"

import RemoteIDPCoordinator from "../remote-idp"

const config = {
  guards: {
    isDeviceRegistered() {
      return false
    },
  },
}

describe("Remote IDP coordinator", () => {
  it("should render", async () => {
    const testMachine = RemoteSenderMachine.withConfig({ ...config })
    render(<RemoteIDPCoordinator machine={testMachine} />)
    await waitFor(() => screen.getByText("RemoteIDPCoordinator"))
    expect(screen.getByText("RemoteIDPCoordinator")).toBeDefined()
  })
  it("should render known device flow", async () => {
    const testMachine = RemoteSenderMachine.withConfig({
      ...config,
      guards: {
        isDeviceRegistered() {
          return true
        },
      },
    })
    render(<RemoteIDPCoordinator machine={testMachine} />)
    await waitFor(() => screen.getByText("Start"))
    expect(screen.getByText("Start")).toBeDefined()
  })
  describe("posts delegation message upon completion into pubsub channel", () => {})
})

export {}
