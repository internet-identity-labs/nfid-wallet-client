import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import useSWR, { SWRConfiguration } from "swr"

import { unpackResponse } from "frontend/integration/_common"
import {
  MessageHttpResponse,
  Topic,
} from "frontend/integration/_ic_api/pub_sub_channel.did"
import { pubsub } from "frontend/integration/actors"

import {
  JSONSerialisableSignedDelegation,
  ReconstructableIdentity,
} from "../internet-identity"

interface BaseMessage {
  type:
    | "remote-login-wait-for-user"
    | "remote-nfid-login-register"
    | "remote-login-register"
}

export const WAIT_FOR_CONFIRMATION_MESSAGE: BaseMessage = {
  type: "remote-login-wait-for-user",
}

export interface WaitForConfirmationMessage extends BaseMessage {
  type: "remote-login-wait-for-user"
}

export function isWaitForConfigramtionMessage(
  message: BaseMessage,
): message is WaitForConfirmationMessage {
  return message.type === "remote-login-wait-for-user"
}

export interface RemoteLoginRegisterMessage extends BaseMessage {
  anchor: number
  reconstructableIdentity: ReconstructableIdentity
  signedDelegation: JSONSerialisableSignedDelegation
}

export function buildRemoteLoginRegisterMessage(
  anchor: bigint,
  chain: DelegationChain,
  sessionKey: Ed25519KeyIdentity,
  jsonSerialisableDelegation: JSONSerialisableSignedDelegation,
): RemoteLoginRegisterMessage {
  return {
    type: "remote-login-register",
    anchor: Number(anchor),
    reconstructableIdentity: { chain, sessionKey },
    signedDelegation: jsonSerialisableDelegation,
  }
}

export function isRemoteLoginRegisterMessage(
  message: BaseMessage,
): message is RemoteLoginRegisterMessage {
  return (message as BaseMessage).type === "remote-login-register"
}

export interface NFIDLoginRegisterMessage extends BaseMessage {
  anchor: number
  reconstructableIdentity: ReconstructableIdentity
}

export function isNFIDLoginRegisterMessage(
  message: BaseMessage,
): message is NFIDLoginRegisterMessage {
  return message.type === "remote-nfid-login-register"
}

export function buildRemoteNFIDLoginRegisterMessage(
  anchor: bigint,
  chain: DelegationChain,
  sessionKey: Ed25519KeyIdentity,
): NFIDLoginRegisterMessage {
  return {
    type: "remote-nfid-login-register",
    anchor: Number(anchor),
    reconstructableIdentity: { chain, sessionKey },
  }
}

function sanitizeResponse(message: MessageHttpResponse) {
  return {
    data: message.body,
    error: message.error,
    status_code: message.status_code,
  }
}

export async function createTopic(topic: Topic) {
  return pubsub
    .create_topic(topic)
    .then((r) => unpackResponse(sanitizeResponse(r)))
}

export async function postMessages(topic: Topic, messages: any[]) {
  return pubsub
    .post_messages(
      topic,
      messages.map((m) => JSON.stringify(m)),
    )
    .then((r) => unpackResponse(sanitizeResponse(r)))
}

export async function getMessages(topic: Topic) {
  return pubsub
    .get_messages(topic)
    .then((r) => unpackResponse(sanitizeResponse(r)))
}

export const useMessages = (
  options: SWRConfiguration = {
    refreshInterval: 2000,
  },
) => {
  const { data, error, mutate } = useSWR<string[]>(
    "messages",
    getMessages,
    options,
  )
  return {
    messages: data,
    error,
    isLoading: !error && !data,
  }
}
