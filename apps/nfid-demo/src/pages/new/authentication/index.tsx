import { AuthenticationForm } from "apps/nfid-demo/src/components/authentication"
import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"

import { SectionTemplate } from "../section"

export const Authentication = () => {
  const { identity } = useAuthenticationContext()

  return (
    <SectionTemplate
      id="authentication"
      title={"1. Authentication"}
      method="nfid.getDelegation()"
      subtitle={
        "To use global delegations, you need provide at least one target canisterID"
      }
      codeSnippet={`const { data: nfid } = useSWRImmutable("nfid", () =>
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
`}
      jsonResponse={identity ? JSON.stringify(identity, null, 2) : "{}"}
      example={<AuthenticationForm />}
    />
  )
}
