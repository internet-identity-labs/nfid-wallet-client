import { useActor } from "@xstate/react"
import React from "react"

import { mapPersonaToLegacy } from "frontend/integration/identity-manager"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import { AuthorizeAppMultiAccount } from "frontend/ui/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/ui/pages/authorize-app/single-account"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function AuthorizationCoordinator({ actor }: Actor<AuthorizationActor>) {
  const [state, send] = useActor(actor)

  React.useEffect(() => {
    console.debug("AuthorizationCoordinator", {
      context: state.context,
      state: state.value,
    })
  }, [state.context, state.value])

  const loadingMessage = React.useMemo(
    () =>
      ((state.matches("FetchAccounts") || state.matches("Start")) &&
        `Loading your ${state.context.appMeta?.name} accounts `) ||
      (state.matches("CreateAccount") &&
        `Creating your ${state.context.appMeta?.name} account`) ||
      (state.matches("GetDelegation") &&
        `Signing in to ${state.context.appMeta?.name}`),
    [state.context.appMeta, state.value],
  )

  switch (true) {
    case state.matches("Start"):
    case state.matches("PresentAccounts"):
    case state.matches("FetchAccounts"):
    case state.matches("CreateAccount"):
    case state.matches("GetDelegation"):
      return state.context.accountsLimit === 1 ? (
        <AuthorizeAppSingleAccount
          isAuthenticated
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          isLoading={
            state.matches("Start") ||
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          loadingMessage={loadingMessage}
          onContinueButtonClick={function (): Promise<void> {
            throw new Error(
              `AuthorizationCoordinator onContinueButtonClick not implemented.`,
            )
          }}
        />
      ) : (
        <AuthorizeAppMultiAccount
          isAuthenticated
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          accountsLimit={state.context.accountsLimit}
          isLoading={
            state.matches("Start") ||
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          loadingMessage={loadingMessage}
          accounts={state.context?.accounts?.map(mapPersonaToLegacy) || []}
          onLogin={async (accountId) =>
            send({ type: "SELECT_ACCOUNT", data: { accountId: accountId } })
          }
          onUnlockNFID={function (): Promise<any> {
            throw new Error(
              `AuthorizationCoordinator onUnlockNFID not implemented.`,
            )
          }}
          onCreateAccount={async () => send("CREATE_ACCOUNT")}
        />
      )
    default:
      return <ScreenResponsive isLoading />
  }
}
