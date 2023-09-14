import {
  Actor,
  ActorSubclass,
  Agent,
  HttpAgent,
  Identity,
} from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import clsx from "clsx"
import React from "react"
import useSWRImmutable from "swr/immutable"

const loadPrincipalIdForIdentity = async ({
  identity,
  canisterId,
}: {
  identity: Identity
  canisterId: string
}) => {
  const method = "get_principal"
  const agent: Agent = new HttpAgent({
    host: "https://ic0.app",
    identity,
  })
  const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    return IDL.Service({
      [method]: IDL.Func([], [IDL.Text], []),
    })
  }

  const actor: ActorSubclass = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
  const result = (await actor[method]()) as string
  console.debug("loadPrincipalIdForIdentity", { result })
  return result
}

interface PrincipalIdFromIdentityProps {
  identity?: Identity
  canisterId: string
}
export const PrincipalIdFromIdentity: React.FC<
  PrincipalIdFromIdentityProps
> = ({ identity, canisterId }) => {
  const {
    data: principalId,
    isLoading,
    error,
  } = useSWRImmutable(
    identity && canisterId ? [identity, canisterId, "principalId"] : null,
    ([identity, canisterId]) =>
      loadPrincipalIdForIdentity({ identity, canisterId }),
  )

  const principalIds = React.useMemo(() => {
    return {
      fromCanister: principalId,
      fromIdentity: identity?.getPrincipal().toText(),
    }
  }, [principalId, identity])

  console.debug("debug PrincipalIdFromIdentity", {
    principalIds,
    isLoading,
    error,
  })
  return (
    <div
      className={clsx(
        "w-full border border-gray-200 rounded-xl",
        "px-5 py-4 mt-8",
        "sm:px-[30px] sm:py-[26px]",
      )}
    >
      <h2 className={clsx("font-bold mb-1")}>PrincipalId:</h2>
      <pre>
        {identity
          ? isLoading
            ? "Loading..."
            : JSON.stringify(principalIds, null, 2)
          : "Not authenticated"}
      </pre>
    </div>
  )
}
