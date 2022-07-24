import { useActor } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { mapPersonaToLegacy } from "frontend/integration/identity-manager"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function AuthorizationCoordinator({ actor }: Actor<AuthorizationActor>) {
  const [state, send] = useActor(actor)

  console.debug("AuthorizationCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("PresentAccounts"):
    case state.matches("FetchAccounts"):
    case state.matches("CreateAccount"):
    case state.matches("GetDelegation"):
      return (
        <ScreenResponsive
          isLoading={
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          className="flex flex-col items-center"
        >
          <AuthorizeApp
            applicationName=""
            isAuthenticated={!!state.context.authSession}
            accounts={state.context?.accounts?.map(mapPersonaToLegacy) || []}
            onUnlockNFID={async () => {}}
            onLogin={async (accountId) =>
              send({ type: "SELECT_ACCOUNT", data: { accountId } })
            }
            onCreateAccount={async () => send("CREATE_ACCOUNT")}
          />
        </ScreenResponsive>
      )
    default:
      return <ScreenResponsive isLoading />
  }
}
