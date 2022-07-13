import type { Principal } from "@dfinity/principal"

export type Error = string
export type Message = string
export interface MessageHttpResponse {
  body: [] | [Array<Message>]
  error: [] | [Error]
  status_code: number
}
export type Topic = string
export interface _SERVICE {
  create_topic: (arg_0: Topic) => Promise<MessageHttpResponse>
  delete_topic: (arg_0: Topic) => Promise<MessageHttpResponse>
  get_messages: (arg_0: Topic) => Promise<MessageHttpResponse>
  ping: () => Promise<undefined>
  post_messages: (
    arg_0: Topic,
    arg_1: Array<Message>,
  ) => Promise<MessageHttpResponse>
}
