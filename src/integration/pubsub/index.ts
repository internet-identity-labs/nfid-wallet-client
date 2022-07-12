import { unpackResponse } from "frontend/comm/.common"
import { pubsub } from "frontend/comm/actors"
import {
  MessageHttpResponse,
  Topic,
} from "frontend/comm/idl/pub_sub_channel.did"

export const WAIT_FOR_CONFIRMATION_MESSAGE = {
  type: "remote-login-wait-for-user",
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
