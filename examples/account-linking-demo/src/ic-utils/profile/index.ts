import { Actor, Identity } from "@dfinity/agent"
import { idlFactory } from "ic/profile.did"
import { _SERVICE } from "ic/profile.types"

import { getAgent } from "../get-agent"

const PROFILE_CANISTER = process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID as string

interface UseProfileProps {
  identity?: Identity
}
export const createProfileActor = ({ identity }: UseProfileProps) => {
  const agent = getAgent({
    host: process.env.NEXT_PUBLIC_IC_HOST as string,
    identity,
  })
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: PROFILE_CANISTER,
  })

  return {
    ...actor,
    isAuthenticated: !identity?.getPrincipal().isAnonymous(),
  }
}
