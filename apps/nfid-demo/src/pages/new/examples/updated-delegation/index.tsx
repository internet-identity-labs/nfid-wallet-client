import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import React from "react"

import { DelegationType } from "@nfid/embed"

import { ExampleError } from "../../error"
import { ExampleMethod } from "../../method"
import { SectionTemplate } from "../../section"
import { TargetCanisterForm } from "../authentication/target-canister-from"

const CODE_SNIPPET = `
const nfid = await NFID.init({ origin: NFID_PROVIDER_URL })
const identity = await nfid.updateGlobalDelegation()
`

const Example = () => {
  const { nfid, identity, setIdentity } = useAuthenticationContext()

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
    return <ExampleError>You cannot update anonymous delegations</ExampleError>
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
        <>
          If a user is authenticated with their main wallet address, an
          <ExampleMethod>updateGlobalDelegation</ExampleMethod> method is
          exposed to get another delegation with an extended expiration. This is
          useful in case you've created a user-owned canister after
          authentication that the user should make authenticated calls to
          without prompts. Just make sure those new canisters also conform to
          the{" "}
          <a
            className="text-blue-500"
            href="https://github.com/dfinity/ICRC/issues/32"
            target="_blank"
            rel="noreferrer"
          >
            ICRC-28
          </a>{" "}
          spec.
        </>
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={identity ? JSON.stringify(identity, null, 2) : "{}"}
      example={<Example />}
    />
  )
}
