import { useSelector } from "@xstate/react"
import type { AnyActorRef } from "xstate"
export function useActorSnapshot<TActor extends AnyActorRef>(actor: TActor) {
  const snapshot = useSelector(actor, (s) => s)
  return [snapshot, actor.send.bind(actor)] as const
}
