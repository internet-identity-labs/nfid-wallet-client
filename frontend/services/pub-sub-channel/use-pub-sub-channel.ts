import React from "react"
import { Actor, HttpAgent } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { CONFIG } from "frontend/config"

import {
  Topic,
  _SERVICE,
} from "frontend/services/pub-sub-channel/pub_sub_channel.did"
import { idlFactory as pub_sub_channel_idl } from "frontend/services/pub-sub-channel/pub_sub_channel_idl"

const pubSubCanisterId: string = CONFIG.PUB_SUB_CHANNEL_CANISTER_ID as string

if (!pubSubCanisterId)
  throw new Error("you need to add VITE_MP_CANISTER_ID to your environment")

const getAgent = () => {
  const agent = new HttpAgent({})
  // Only fetch the root key when we're not in prod
  if (CONFIG.II_ENV === "development") {
    agent.fetchRootKey()
  }
  return agent
}
export const canisterIdPrincipal: Principal =
  Principal.fromText(pubSubCanisterId)

export const baseActor = Actor.createActor<_SERVICE>(pub_sub_channel_idl, {
  agent: getAgent(),
  canisterId: pubSubCanisterId,
})

export const usePubSubChannel = () => {
  const createTopic = React.useCallback(async (key: Topic) => {
    return await baseActor.create_topic(key)
  }, [])
  const deleteTopic = React.useCallback(async (key: Topic) => {
    return await baseActor.delete_topic(key)
  }, [])

  const getMessages = React.useCallback(async (key: Topic) => {
    return await baseActor.get_messages(key)
  }, [])

  const postMessages = React.useCallback(
    async (key: Topic, messages: string[]) => {
      return await baseActor.post_messages(key, messages)
    },
    [],
  )
  return {
    createTopic,
    deleteTopic,
    getMessages,
    postMessages,
  }
}
