import React from "react"

import { pubsub } from "frontend/api/actors"
import { Topic } from "frontend/api/idl/pub_sub_channel.did"

export const usePubSubChannel = () => {
  const createTopic = React.useCallback(async (key: Topic) => {
    return await pubsub.create_topic(key)
  }, [])

  const deleteTopic = React.useCallback(async (key: Topic) => {
    return await pubsub.delete_topic(key)
  }, [])

  const getMessages = React.useCallback(async (key: Topic) => {
    return await pubsub.get_messages(key)
  }, [])

  const postMessages = React.useCallback(
    async (key: Topic, messages: string[]) => {
      return await pubsub.post_messages(key, messages)
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
