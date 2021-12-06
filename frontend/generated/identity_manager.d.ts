import type { Principal } from "@dfinity/principal"
export interface Account {
  name: string
  email: string
  principal_id: string
  phone_number: string
}
export interface BoolHttpResponse {
  data: [] | [boolean]
  error: [] | [Error]
  status_code: number
}
export type Error = string
export interface HTTPAccountRequest {
  name: string
  email: string
  phone_number: string
}
export interface HTTPAccountResponse {
  data: [] | [Account]
  error: [] | [Error]
  status_code: number
}
export interface HTTPAccountUpdateRequest {
  name: [] | [string]
  email: [] | [string]
  phone_number: [] | [string]
}
export type Message = string
export interface MessageHttpResponse {
  body: [] | [Array<Message>]
  status_code: number
}
export type PhoneNumber = string
export type Token = string
export type Topic = string
export interface _SERVICE {
  create_account: (arg_0: HTTPAccountRequest) => Promise<HTTPAccountResponse>
  create_topic: (arg_0: Topic) => Promise<MessageHttpResponse>
  delete_topic: (arg_0: Topic) => Promise<MessageHttpResponse>
  get_account: () => Promise<HTTPAccountResponse>
  get_messages: (arg_0: Topic) => Promise<MessageHttpResponse>
  post_messages: (
    arg_0: Topic,
    arg_1: Array<Message>,
  ) => Promise<MessageHttpResponse>
  update_account: (
    arg_0: HTTPAccountUpdateRequest,
  ) => Promise<HTTPAccountResponse>
  verify_phone_number: (arg_0: PhoneNumber) => Promise<BoolHttpResponse>
  verify_token: (arg_0: Token) => Promise<BoolHttpResponse>
}
