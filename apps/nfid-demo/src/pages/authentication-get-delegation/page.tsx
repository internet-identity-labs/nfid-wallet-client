import clsx from "clsx"

import { H1 } from "@nfid-frontend/ui"

import { useAuthentication } from "../../hooks/useAuthentication"
import { PageTemplate } from "../page-template"
import { PrincipalIdFromIdentity } from "./components/principal-from-identity"

export const PageAuthenticationGetDelegation = () => {
  const { identity, error } = useAuthentication()

  console.debug("PageAuthenticationGetDelegation", {
    error,
  })

  return (
    <PageTemplate title="Authentication / Registration">
      <H1 className="title">Authentication / Registration</H1>
      <div>
        by using <strong>@nfid/embed</strong>
      </div>

      {!error ? (
        <PrincipalIdFromIdentity
          canisterId={"irshc-3aaaa-aaaam-absla-cai"}
          identity={identity}
        />
      ) : (
        <div
          className={clsx(
            "w-full border border-gray-200 rounded-xl",
            "px-5 py-4 mt-8",
            "sm:px-[30px] sm:py-[26px]",
          )}
        >
          <h2 className={clsx("font-bold mb-1")}>NFID Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </PageTemplate>
  )
}
