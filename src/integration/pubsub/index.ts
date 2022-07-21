import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity"
import useSWR, { Fetcher, Key, SWRConfiguration, SWRHook } from "swr"

import { unpackResponse } from "frontend/integration/_common"
import {
  MessageHttpResponse,
  Topic,
} from "frontend/integration/_ic_api/pub_sub_channel.did"
import { pubsub } from "frontend/integration/actors"

import { JSONSerialisableSignedDelegation } from "../internet-identity"

export const WAIT_FOR_CONFIRMATION_MESSAGE = {
  type: "remote-login-wait-for-user",
}

export function buildRemoteLoginRegisterMessage(
  anchor: bigint,
  chain: DelegationChain,
  sessionKey: Ed25519KeyIdentity,
  jsonSerialisableDelegation: JSONSerialisableSignedDelegation,
): string {
  return JSON.stringify({
    type: "remote-login-register",
    userNumber: anchor.toString(),
    nfid: { chain, sessionKey },
    ...jsonSerialisableDelegation,
  })
}

export function buildRemoteNFIDLoginRegisterMessage(
  anchor: bigint,
  chain: DelegationChain,
  sessionKey: Ed25519KeyIdentity,
) {
  return JSON.stringify({
    type: "remote-nfid-login-register",
    userNumber: anchor.toString(),
    nfid: { chain, sessionKey },
  })
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

export async function postMessages(topic: Topic, messages: string[]) {
  return pubsub
    .post_messages(topic, messages)
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
  const { data, error, mutate } = useSWR("messages", getMessages, options)
  return {
    messages: data,
    error,
    isLoading: !error && !data,
  }
}
