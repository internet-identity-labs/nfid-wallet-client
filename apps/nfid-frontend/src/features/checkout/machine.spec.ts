import { interpret } from "xstate"
import { waitFor } from "xstate/lib/waitFor"

import { PreparedSignatureResponse } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

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
      Preparation: {
        DecodeRequest: {},
        PrepareSignature: {},
      },
      UI: "Loader",
    })

    jest.advanceTimersByTime(3001)

    await waitFor(service, (state) => state.matches("UI.Checkout"))

    expect(service.state.value).toEqual({
      Preparation: {
        DecodeRequest: {},
        PrepareSignature: {},
      },
      UI: "Checkout",
    })

    service.send("VERIFY")
    await waitFor(service, (state) => state.matches("UI.WaitForSignature"))

    // 15000ms signature preparation minus 3000 ms loader delay
    jest.advanceTimersByTime(12000)

    await waitFor(service, (state) => state.matches("UI.Verifying"))

    expect(service.state.value).toEqual({
      Preparation: {
        DecodeRequest: {},
        PrepareSignature: {},
      },
      UI: "Verifying",
    })
  })
})
