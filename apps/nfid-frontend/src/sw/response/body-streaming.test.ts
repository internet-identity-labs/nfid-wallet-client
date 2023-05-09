import { IDL } from "@dfinity/candid"
import { Principal } from "@dfinity/principal"

import {
  QueryResponse,
  ReplicaRejectCode,
  QueryResponseStatus,
  QueryResponseReplied,
  QueryResponseRejected,
} from "frontend/typings"

import {
  createAgentMock,
  createBody,
  createHttpResponse,
  createStreamingCallbackResponse,
  createStreamingCallbackToken,
} from "../test"
import { streamBody } from "./body-streaming"

describe("streamBody", () => {
  const canisterId = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai")
  const streamingCallbackMethod = "callback_method"

  it("should not stream anything if there is no streaming callback", async () => {
    const body = createBody("Hello World!")
    const agentMock = createAgentMock()
    const response = createHttpResponse({
      body,
      streaming_strategy: [],
    })

    const result = await streamBody(agentMock, response, canisterId)

    expect(result).toEqual(body)
    expect(agentMock.query).not.toHaveBeenCalled()
  })

  it("should stream body chunks when there is a streaming callback", async () => {
    const fullBody = createBody("Hello World!")
    const chunkedBody = createBody("Hel")

    const callbackTokenZero = "callback_token_zero"
    const callbackTokenOne = "callback_token_one"
    const callbackTokenTwo = "callback_token_two"

    const streamingCallbackToken =
      createStreamingCallbackToken(callbackTokenZero)

    const agentMock = createAgentMock([
      // @ts-ignore
      createStreamingCallbackResponse(createBody("lo "), callbackTokenOne),
      // @ts-ignore
      createStreamingCallbackResponse(createBody("Wor"), callbackTokenTwo),
      // @ts-ignore
      createStreamingCallbackResponse(createBody("ld!")),
    ])
    const response = createHttpResponse({
      body: chunkedBody,
      streaming_strategy: [
        {
          Callback: {
            token: streamingCallbackToken,
            callback: [canisterId, streamingCallbackMethod],
          },
        },
      ],
    })

    const result = await streamBody(agentMock, response, canisterId)

    expect(result).toEqual(fullBody)
    expect(agentMock.query).toHaveBeenCalledTimes(3)
    expect(agentMock.query.mock.calls[0]).toEqual([
      canisterId,
      {
        methodName: streamingCallbackMethod,
        arg: IDL.encode([IDL.Text], [callbackTokenZero]),
      },
    ])
    expect(agentMock.query.mock.calls[1]).toEqual([
      canisterId,
      {
        methodName: streamingCallbackMethod,
        arg: IDL.encode([IDL.Text], [callbackTokenOne]),
      },
    ])
    expect(agentMock.query.mock.calls[2]).toEqual([
      canisterId,
      {
        methodName: streamingCallbackMethod,
        arg: IDL.encode([IDL.Text], [callbackTokenTwo]),
      },
    ])
  })

  it("should throw if there are too many callbacks", async () => {
    const chunkedBody = createBody()
    const callbackToken = "callback_token_one"
    const streamingCallbackToken = createStreamingCallbackToken(callbackToken)
    const responses = Array<QueryResponse>(1050).fill(
      createStreamingCallbackResponse(chunkedBody, callbackToken),
    )
    // @ts-ignore
    const agentMock = createAgentMock(responses)

    const response = createHttpResponse({
      body: chunkedBody,
      streaming_strategy: [
        {
          Callback: {
            token: streamingCallbackToken,
            callback: [canisterId, streamingCallbackMethod],
          },
        },
      ],
    })

    await expect(
      streamBody(agentMock, response, canisterId),
    ).rejects.toThrowError("Exceeded streaming callback limit")
  })

  it("should throw if a callback fails", async () => {
    const chunkedBody = createBody()
    const callbackToken = "callback_token_one"
    const streamingCallbackToken = createStreamingCallbackToken(callbackToken)
    const errorResponse: QueryResponseRejected = {
      status: QueryResponseStatus.Rejected,
      reject_code: ReplicaRejectCode.CanisterError,
      reject_message: "Canister got tired and went to sleep",
    }
    // @ts-ignore
    const agentMock = createAgentMock([errorResponse])

    const response = createHttpResponse({
      body: chunkedBody,
      streaming_strategy: [
        {
          Callback: {
            token: streamingCallbackToken,
            callback: [canisterId, streamingCallbackMethod],
          },
        },
      ],
    })

    await expect(
      streamBody(agentMock, response, canisterId),
    ).rejects.toThrowError("Streaming callback error: " + errorResponse)
  })

  it("should throw if a callback has the incorrect type", async () => {
    const chunkedBody = createBody()
    const callbackToken = "callback_token_one"
    const streamingCallbackToken = createStreamingCallbackToken(callbackToken)
    const errorResponse: QueryResponseReplied = {
      status: QueryResponseStatus.Replied,
      reply: {
        arg: IDL.encode(
          [
            IDL.Record({
              status: IDL.Nat16,
              statusText: IDL.Text,
            }),
          ],
          [
            {
              status: 200,
              statusText: "OK",
            },
          ],
        ),
      },
    }
    // @ts-ignore
    const agentMock = createAgentMock([errorResponse])

    const response = createHttpResponse({
      body: chunkedBody,
      streaming_strategy: [
        {
          Callback: {
            token: streamingCallbackToken,
            callback: [canisterId, streamingCallbackMethod],
          },
        },
      ],
    })

    await expect(
      streamBody(agentMock, response, canisterId),
    ).rejects.toThrowError("Cannot find required field body")
  })
})
