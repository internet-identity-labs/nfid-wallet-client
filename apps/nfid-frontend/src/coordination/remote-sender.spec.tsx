/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react"

import RemoteSenderMachine from "frontend/state/machines/authentication/remote-sender"
import { getDataFromPath } from "frontend/state/machines/authentication/remote-sender.spec"

import RemoteIDPCoordinator from "./remote-sender"

const config = {
  guards: {
    isDeviceRegistered() {
      return false
    },
  },
  services: {
    getDataFromPath,
    getAppMeta: () => Promise.resolve({ name: "My Application" }),
  },
}

describe("Remote IDP coordinator", () => {
  it("should render", async () => {
    const testMachine = RemoteSenderMachine.withConfig({
      ...config,
    })
    await waitFor(
      async () => void render(<RemoteIDPCoordinator machine={testMachine} />),
    )
    // await waitFor(async () =>
    //   expect(screen.getByText("to continue to My Application")).toBeDefined(),
    // )
  })
  // it("should render known device flow", async () => {
  //   const testMachine = RemoteSenderMachine.withConfig({
  //     ...config,
  //     guards: {
  //       isDeviceRegistered() {
  //         return true
  //       },
  //     },
  //   })
  //   render(<RemoteIDPCoordinator machine={testMachine} />)
  //   await waitFor(() => screen.getByText("Loading Devices"))
  //   expect(screen.getByText("Loading Devices")).toBeDefined()
  // })
  // describe("posts delegation message upon completion into pubsub channel", () => {})
})
