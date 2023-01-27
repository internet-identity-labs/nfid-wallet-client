/**
 * @jest-environment jsdom
 */
import RemoteSenderMachine from "frontend/state/machines/authentication/remote-sender"
import { getDataFromPath } from "frontend/state/machines/authentication/remote-sender.spec"

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
    RemoteSenderMachine.withConfig({
      ...config,
    })
    // await waitFor(
    //   async () => void render(<RemoteIDPCoordinator machine={testMachine} />),
    // )
    // await screen.findByText("Create an NFID")
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
