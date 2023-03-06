import { interpret } from "xstate"
import { waitFor } from "xstate/lib/waitFor"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import { RPCResponse, RPC_BASE } from "../embed/rpc-service"
import CheckoutMachine from "./machine"

describe("checkout machine", () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  it("should work like 👇", async () => {
    const config = {
      services: {
        prepareSignature: () => {
          return new Promise<PreparedSignatureResponse>((resolve) => {
            setTimeout(() => {
              resolve({ hash: "data", message: new Uint8Array(), tx: {} })
            }, 15000)
          })
        },
        sendTransactionService: () =>
          new Promise<RPCResponse>((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ...RPC_BASE,
                  id: "1",
                  result: "0x123",
                }),
              1000,
            )
          }),
        decodeRequest: () => Promise.resolve({ data: "decoded" }),
      },
    }
    const machine = CheckoutMachine.withConfig(config).withContext({
      rpcMessage: {
        jsonrpc: "2.0",
        id: "1",
        method: "eth_sign",
        params: [],
      },
      authSession: {} as AuthSession,
    })

    const service = interpret(machine)
    service.start()

    expect(service.state.value).toEqual({
      initial: {
        Preparation: {
          DecodeRequest: "Decode",
          PrepareSignature: "Prepare",
        },
        UI: "Loader",
      },
    })

    jest.advanceTimersByTime(3001)

    await waitFor(service, (state) => state.matches("initial.UI.Checkout"))

    expect(service.state.value).toEqual({
      initial: {
        Preparation: {
          DecodeRequest: "Done",
          PrepareSignature: "Prepare",
        },
        UI: "Checkout",
      },
    })

    service.send("VERIFY")
    await waitFor(service, (state) =>
      state.matches("initial.UI.WaitForSignature"),
    )

    // 15000ms signature preparation minus 3000 ms loader delay
    jest.advanceTimersByTime(12000)

    await waitFor(service, (state) => state.matches("initial.UI.Verifying"))

    expect(service.state.value).toEqual(
      expect.objectContaining({
        initial: {
          Preparation: {
            DecodeRequest: "Done",
            PrepareSignature: "Done",
          },
          UI: "Verifying",
        },
      }),
    )

    jest.advanceTimersByTime(1000)

    await waitFor(service, (state) => state.matches("initial.UI.Success"))

    expect(service.state.value).toEqual(
      expect.objectContaining({
        initial: {
          Preparation: {
            DecodeRequest: "Done",
            PrepareSignature: "Done",
          },
          UI: "Success",
        },
      }),
    )

    expect(service.state.context.rpcResponse).toEqual({
      ...RPC_BASE,
      id: "1",
      result: "0x123",
    })

    service.send("CLOSE")

    expect(service.state.value).toEqual("done")
  })
})
