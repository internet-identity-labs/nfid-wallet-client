import { unpackResponse } from "frontend/comm/.common"
import { pubsub } from "frontend/comm/actors"
import {
  MessageHttpResponse,
  Topic,
} from "frontend/comm/idl/pub_sub_channel.did"

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
