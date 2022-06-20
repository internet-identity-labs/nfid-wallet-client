import React from "react"

import { pubsub } from "frontend/api/actors"
import { Topic } from "frontend/api/idl/pub_sub_channel.did"
import { useAuthentication } from "frontend/hooks/use-authentication"

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
    return await pubsub.get_messages(key)
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
