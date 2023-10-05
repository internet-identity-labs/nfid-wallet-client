import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { AuthenticationForm } from "apps/nfid-demo/src/pages/new/examples/authentication/authentication"

import { ExampleMethod } from "../../method"
import { SectionTemplate } from "../../section"

const CODE_SNIPPET = `const { data: nfid } = useSWRImmutable("nfid", () =>
  NFID.init({ origin: NFID_PROVIDER_URL }),
)

const handleAuthenticate = React.useCallback(async () => {
  if (!nfid) return alert("NFID is not initialized")

  try {
    const identity = await nfid.getDelegation(
      targetCanisterIds.length ? { targets: targetCanisterIds } : undefined,
    )

    setResponse(identity)
  } catch (error: Error) {
    setResponse({ error: error.message })
  }
}, [nfid, setIdentity, targetCanisterIds])
`

export const Authentication = () => {
  const { identity } = useAuthenticationContext()

  return (
    <SectionTemplate
      id="authentication"
      title={"1. Authentication"}
      method="nfid.getDelegation()"
      subtitle={
        <>
          After adding and initializing NFID, call
          <ExampleMethod>getDelegation</ExampleMethod> to open the user
          authentication window. By default, users will only have the option to
          connect with an application-specific identifier. Provide canister
          targets as per the{" "}
          <a
            className="text-blue-500"
            href="https://github.com/dfinity/ICRC/issues/32"
            target="_blank"
            rel="noreferrer"
          >
            ICRC-28
          </a>{" "}
          spec to support main wallet address authentication, asset balance
          lookups, approval requests for fungible and non-fungible asset
          transfers, and approval requests for cross-canister calls.
        </>
      }
      codeSnippet={CODE_SNIPPET}
      jsonResponse={identity ? JSON.stringify(identity, null, 2) : "{}"}
      example={<AuthenticationForm />}
    />
  )
}
