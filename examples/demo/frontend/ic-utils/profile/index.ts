// TODO: fix this
// eslint-disable-next-line no-unused-vars
import { Identity } from "@dfinity/agent"
// @ts-ignore
import { idlFactory } from "/.dfx/local/canisters/profile/profile.did.js"
import React from "react"
import { createActor } from "../../ic-utils/create-actor"

interface UseProfileProps {
  identity?: Identity | null
}
export const useProfile = ({ identity }: UseProfileProps) => {
  const profileActor = React.useMemo(() => {
    const profileCanister = process.env.VITE_APP_PROFILE_CANISTER_ID

    return createActor(profileCanister, idlFactory, {
      agentOptions: {
        identity,
        host: process.env.VITE_APP_IC_HOST || "http://localhost:8000",
      },
    })
  }, [identity])

  const whoami = React.useCallback(async () => {
    return await profileActor.whoami()
  }, [profileActor])

  return { whoami }
}
