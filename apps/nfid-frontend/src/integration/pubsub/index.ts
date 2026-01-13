import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"

import { SWRConfiguration } from "swr"

import { pubsub } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { unpackResponse } from "frontend/integration/_common"
import {
  MessageHttpResponse,
  Topic,
} from "frontend/integration/_ic_api/pub_sub_channel.d"

import { ReconstructableIdentity } from "../internet-identity"

interface BaseMessage {
  type:
    | "remote-login-wait-for-user"
    | "remote-nfid-login-register"
    | "remote-login-register"
}

export const WAIT_FOR_CONFIRMATION_MESSAGE: BaseMessage = {
  type: "remote-login-wait-for-user",
}

export interface RemoteLoginRegisterMessage extends BaseMessage {
  anchor: number
  reconstructableIdentity: ReconstructableIdentity
}

export function buildRemoteLoginRegisterMessage(
  anchor: bigint,
  chain: DelegationChain,
  sessionKey: Ed25519KeyIdentity,
): RemoteLoginRegisterMessage {
  return {
    type: "remote-login-register",
    anchor: Number(anchor),
    reconstructableIdentity: { chain, sessionKey },
  }
}

export function isRemoteLoginRegisterMessage(
  message: BaseMessage,
): message is RemoteLoginRegisterMessage {
  return message.type === "remote-login-register"
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
    .then((r) => {
      console.debug("createTopic", { response: r })
      return r
    })
    .catch((e) => {
      throw new Error(`createTopic pubsub.create_topic: ${e.message}`)
    })
}

export async function postMessages(topic: Topic, messages: any[]) {
  console.debug("postMessages", { topic, messages })
  return pubsub
    .post_messages(
      topic,
      messages.map((m) => JSON.stringify(m)),
    )
    .then((r) => unpackResponse(sanitizeResponse(r)))
    .catch(async (_e) => {
      await createTopic(topic)
        .then(() => postMessages(topic, messages))
        .catch((e) => {
          throw new Error(`postMessages pubsub.post_messages: ${e.message}`)
        })
    })
}

export async function getMessages(topic: Topic) {
  console.debug("getMessages", { topic })
  return pubsub
    .get_messages(topic)
    .then((r) => unpackResponse(sanitizeResponse(r)))
    .catch((e) => {
      console.warn(`getMessages pubsub.get_messages: ${e.message}`)
      return []
    })
}

export const useMessages = (
  topic: string,
  options: SWRConfiguration = {
    refreshInterval: 2000,
  },
) => {
  const { data, error } = useSWR<string[]>(
    "messages",
    () => getMessages(topic),
    options,
  )
  return {
    messages: data,
    error,
    isLoading: !error && !data,
  }
}
