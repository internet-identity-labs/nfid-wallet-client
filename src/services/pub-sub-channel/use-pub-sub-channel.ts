import { Actor, HttpAgent } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import {
  Topic,
  _SERVICE,
} from "frontend/services/pub-sub-channel/pub_sub_channel.did"

import { idlFactory as pub_sub_channel_idl } from "./pub_sub_channel_idl"

declare const II_ENV: string
declare const IC_HOST: string
declare const PUB_SUB_CHANNEL_CANISTER_ID: string

const pubSubCanisterId: string = PUB_SUB_CHANNEL_CANISTER_ID as string

if (!pubSubCanisterId)
  throw new Error(
    "you need to add VITE_PUB_SUB_CHANNEL_CANISTER_ID to your environment",
  )

const getAgent = () => {
  const agent = new HttpAgent({
    host: IC_HOST,
  })
  // Only fetch the root key when we're not in prod
  if (II_ENV === "development") {
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
  const { pubsubChannel } = useAuthentication()

  const createTopic = React.useCallback(
    async (key: Topic) => {
      if (!pubsubChannel) throw new Error("unauthorized")
      return await pubsubChannel.create_topic(key)
    },
    [pubsubChannel],
  )

  const deleteTopic = React.useCallback(
    async (key: Topic) => {
      if (!pubsubChannel) throw new Error("unauthorized")
      return await pubsubChannel.delete_topic(key)
    },
    [pubsubChannel],
  )

  const getMessages = React.useCallback(async (key: Topic) => {
    return await baseActor.get_messages(key)
  }, [])

  const postMessages = React.useCallback(
    async (key: Topic, messages: string[]) => {
      if (!pubsubChannel) throw new Error("unauthorized")
      return await pubsubChannel.post_messages(key, messages)
    },
    [pubsubChannel],
  )
  return {
    createTopic,
    deleteTopic,
    getMessages,
    postMessages,
  }
}
