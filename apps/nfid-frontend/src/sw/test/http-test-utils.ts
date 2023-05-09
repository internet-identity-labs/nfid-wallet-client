import { IDL } from "@dfinity/candid"

import { QueryResponseReplied, QueryResponseStatus } from "frontend/typings"

import {
  HttpResponse,
  Token,
} from "../http-interface/canister_http_interface_types"

const defaultBodyContent = "Hello World!"

export function createBody(content: string = defaultBodyContent): Uint8Array {
  return new TextEncoder().encode(content)
}

export function createHttpResponse(
  httpResponse: Partial<HttpResponse> = {},
): HttpResponse {
  return {
    body: new Uint8Array(),
    headers: [],
    status_code: 200,
    streaming_strategy: [],
    upgrade: [],
    ...httpResponse,
  }
}

export const StreamingCallbackResponse = IDL.Record({
  token: IDL.Opt(IDL.Text),
  body: IDL.Vec(IDL.Nat8),
})

export function createStreamingCallbackToken(value: string): Token {
  const token = Object(value)

  Object.defineProperty(token, "type", {
    value: () => IDL.Text,
    writable: true,
    enumerable: false,
    configurable: true,
  })

  return token
}

export function createStreamingCallbackResponse(
  body: Uint8Array,
  token?: string,
): QueryResponseReplied {
  return {
    status: QueryResponseStatus.Replied,
    reply: {
      arg: IDL.encode(
        [StreamingCallbackResponse],
        [
          {
            token: token ? [token] : [],
            body,
          },
        ],
      ),
    },
  }
}
