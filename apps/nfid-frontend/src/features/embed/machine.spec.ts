import { interpret } from "xstate"
import { waitFor } from "xstate/lib/waitFor"

import { makeServiceMock } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import { NFIDEmbedMachine } from "./machine"
import { RPCMessage, RPCResponse, RPC_BASE } from "./rpc-service"

describe("NFIDEmbedMachine", () => {
  it("should work", async () => {
    const AuthenticationMachineMock = makeServiceMock<AuthSession>()
    const TrustDeviceMachineMock = makeServiceMock<void>()
    const EmbedControllerMachineMock = makeServiceMock<RPCResponse>()

    const sendRPCResponse = jest.fn()

    const machine = NFIDEmbedMachine.withContext({}).withConfig({
      services: {
        AuthenticationMachine: AuthenticationMachineMock.service,
        TrustDeviceMachine: TrustDeviceMachineMock.service,
        EmbedControllerMachine: EmbedControllerMachineMock.service,
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
    const service = interpret(machine).start()

    expect(service.state.value).toEqual("AuthenticationMachine")

    AuthenticationMachineMock.resolve({
      sessionSource: "localDevice",
    } as AuthSession)

    await waitFor(service, (state) => state.matches("TrustDevice"))
    expect(service.state.value).toBe("TrustDevice")
    expect(service.state.context).toEqual({
      authSession: { sessionSource: "localDevice" },
    })

    TrustDeviceMachineMock.resolve()
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
    EmbedControllerMachineMock.resolve(rpcResponse)

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
