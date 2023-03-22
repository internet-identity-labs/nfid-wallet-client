import { interpret } from "xstate"
import { waitFor } from "xstate/lib/waitFor"

import { makeServiceMock } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import { NFIDEmbedMachine } from "./machine"
import { RPCResponse, RPC_BASE } from "./rpc-service"

const makeMachineMock = () => {
  const MockAuthenticationMachine = makeServiceMock<AuthSession>()
  const MockTrustDeviceMachine = makeServiceMock<void>()
  const MockEmbedControllerMachine = makeServiceMock<RPCResponse>()

  const sendRPCResponse = jest.fn()

  const machine = NFIDEmbedMachine.withContext({}).withConfig({
    services: {
      AuthenticationMachine: MockAuthenticationMachine.service,
      TrustDeviceMachine: MockTrustDeviceMachine.service,
      EmbedControllerMachine: MockEmbedControllerMachine.service,
      EmbedConnectAccountMachine: () => () => {},
      RPCService: () => () => {},
    },
    actions: {
      sendRPCResponse,
    },
    guards: {
      isAuthenticated: () => true,
    },
  })
  return {
    machine,
    MockAuthenticationMachine,
    MockTrustDeviceMachine,
    MockEmbedControllerMachine,
    sendRPCResponse,
  }
}

describe("NFIDEmbedMachine", () => {
  it("should transition to error state when service throws", async () => {
    const {
      machine,
      MockAuthenticationMachine,
      MockTrustDeviceMachine,
      MockEmbedControllerMachine,
    } = makeMachineMock()
    const service = interpret(machine).start()

    MockAuthenticationMachine.resolve({
      sessionSource: "localDevice",
    } as AuthSession)
    MockTrustDeviceMachine.resolve()
    await waitFor(service, (state) => state.matches("Ready"))
    service.send({
      type: "SEND_TRANSACTION",
      data: { ...RPC_BASE, id: "1", method: "eth_sendTransaction", params: [] },
    })

    const expectedError = new Error("something happened")
    MockEmbedControllerMachine.reject(expectedError)

    await waitFor(service, (state) => state.matches("Error"))

    expect(service.state.value).toBe("Error")
    expect(service.state.context).toEqual(
      expect.objectContaining({
        error: expectedError,
      }),
    )
  })

  it("should send rpc message when EmbedController returns cancel response", async () => {
    const {
      machine,
      sendRPCResponse,
      MockAuthenticationMachine,
      MockTrustDeviceMachine,
      MockEmbedControllerMachine,
    } = makeMachineMock()
    const service = interpret(machine).start()

    expect(service.state.value).toEqual("AuthenticationMachine")

    MockAuthenticationMachine.resolve({
      sessionSource: "localDevice",
    } as AuthSession)

    await waitFor(service, (state) => state.matches("TrustDevice"))
    expect(service.state.value).toBe("TrustDevice")
    expect(service.state.context).toEqual({
      authSession: { sessionSource: "localDevice" },
    })

    MockTrustDeviceMachine.resolve()
    await waitFor(service, (state) => state.matches("Ready"))
    expect(service.state.value).toBe("Ready")

    service.send({
      type: "SEND_TRANSACTION",
      data: { ...RPC_BASE, id: "1", method: "eth_sendTransaction", params: [] },
    })

    await waitFor(service, (state) => state.matches("EmbedController"))
    expect(service.state.value).toBe("EmbedController")

    const rpcResponse = {
      ...RPC_BASE,
      id: "1",
      error: {
        code: 4001,
        message: "User rejected the request",
        data: null,
      },
    }
    MockEmbedControllerMachine.resolve(rpcResponse)

    await waitFor(service, (state) => state.matches("Ready"))
    expect(sendRPCResponse).toHaveBeenCalledWith(
      { authSession: { sessionSource: "localDevice" } },
      expect.objectContaining({
        data: rpcResponse,
      }),
      expect.anything(),
    )
  })
})
