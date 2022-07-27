import { useActor } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { mapPersonaToLegacy } from "frontend/integration/identity-manager"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { AuthorizeAppMultiAccount } from "frontend/ui/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function AuthorizationCoordinator({ actor }: Actor<AuthorizationActor>) {
  const [state, send] = useActor(actor)

  console.debug("AuthorizationCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("Start"):
    case state.matches("PresentAccounts"):
    case state.matches("FetchAccounts"):
    case state.matches("CreateAccount"):
    case state.matches("GetDelegation"):
      return state.context.accountsLimit === 1 ? (
        <AuthorizeAppSingleAccount
          isAuthenticated={!!state.context.authSession}
          applicationName={state.context.appMeta.name}
          applicationLogo={state.context.appMeta.logo}
          isLoading={
            state.matches("Start") ||
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          onContinueButtonClick={function (): Promise<void> {
            throw new Error("Function not implemented.")
          }}
        />
      ) : (
        <AuthorizeAppMultiAccount
          isAuthenticated={!!state.context.authSession}
          applicationName={state.context.appMeta.name}
          applicationLogo={state.context.appMeta.logo}
          accountsLimit={state.context.accountsLimit}
          isLoading={
            state.matches("Start") ||
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          accounts={state.context?.accounts?.map(mapPersonaToLegacy) || []}
          onLogin={async (accountId) =>
            send({
              type: "SELECT_ACCOUNT",
              data: { accountId: accountId ?? "" },
            })
          }
          onUnlockNFID={function (): Promise<any> {
            throw new Error("Function not implemented.")
          }}
          onCreateAccount={async () => send("CREATE_ACCOUNT")}
        />
      )
    default:
      return <ScreenResponsive isLoading />
  }
}
