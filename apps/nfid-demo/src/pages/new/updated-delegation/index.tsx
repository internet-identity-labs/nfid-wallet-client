import { Identity } from "@dfinity/agent"
import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { useAuthentication } from "apps/nfid-demo/src/hooks/useAuthentication"
import React from "react"

import { DelegationType } from "@nfid/embed"

import { TargetCanisterForm } from "../authentication/target-canister-from"
import { SectionTemplate } from "../section"

const CODE_SNIPPET = `
const nfid = await NFID.init({ origin: NFID_PROVIDER_URL })
nfid.updateGlobalDelegation()
`

export const UpdateDelegation = () => {
  const { nfid } = useAuthenticationContext()
  const { targetCanisterIds } = useAuthentication()

  const [loading, setLoading] = React.useState<boolean>(false)
  const [response, setResponse] = React.useState<Identity | undefined>()

  console.debug("UpdateDelegation", { targetCanisterIds })

  const handleUpdateGlobalDelegation = React.useCallback(
    async (targets: string[]) => {
      if (!nfid) throw new Error("NFID not initialized")
      setLoading(true)
      const response = await nfid.updateGlobalDelegation({
        targets,
      })
      setResponse(response)
      setLoading(false)
    },
    [nfid],
  )

  const Example = () => {
    if (nfid?.getDelegationType() === DelegationType.ANONYMOUS) {
      return <div>You cannot update anonymous delegations</div>
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
  return (
    <SectionTemplate
      id="updateDelegation"
      title={"2. Update delegation"}
      method="nfid.updateGlobalDelegation()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={response ? JSON.stringify(response, null, 2) : "{}"}
      example={<Example />}
    />
  )
}
