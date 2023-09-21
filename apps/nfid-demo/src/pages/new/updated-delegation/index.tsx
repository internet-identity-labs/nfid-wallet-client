import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import React from "react"
import { ImWarning } from "react-icons/im"

import { DelegationType } from "@nfid/embed"

import { TargetCanisterForm } from "../authentication/target-canister-from"
import { SectionTemplate } from "../section"

const CODE_SNIPPET = `
const nfid = await NFID.init({ origin: NFID_PROVIDER_URL })
const identity = await nfid.updateGlobalDelegation()
`

const Example = () => {
  const { nfid, setIdentity } = useAuthenticationContext()

  const [loading, setLoading] = React.useState<boolean>(false)

  const handleUpdateGlobalDelegation = React.useCallback(
    async (targets: string[]) => {
      if (!nfid) throw new Error("NFID not initialized")
      setLoading(true)
      const response = await nfid.updateGlobalDelegation({
        targets,
      })
      // @ts-ignore
      setIdentity(response)
      setLoading(false)
    },
    [nfid, setIdentity],
  )

  if (nfid?.getDelegationType() === DelegationType.ANONYMOUS) {
    return nfid.isAuthenticated ? (
      <div className="flex gap-2 p-2 font-medium text-white bg-red-500 rounded">
        <ImWarning />
        <div className="text-sm ">You cannot update anonymous delegations</div>
      </div>
    ) : null
  }

  return (
    <TargetCanisterForm
      submitButtonText="Update delegation"
      submitButtonId="buttonUpdateDelegation"
      isLoading={loading}
      onSubmit={handleUpdateGlobalDelegation}
    />
  )
}

export const UpdateDelegation = () => {
  const { identity } = useAuthenticationContext()
  return (
    <SectionTemplate
      id="updateDelegation"
      title={"2. Update delegation"}
      method="nfid.updateGlobalDelegation()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={identity ? JSON.stringify(identity, null, 2) : "{}"}
      example={<Example />}
    />
  )
}
