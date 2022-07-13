import { useMachine, useActor } from "@xstate/react"
import React from "react"
import { from } from "rxjs"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { setUser } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { mapPersonaToLegacy } from "frontend/integration/identity-manager"
import { AuthenticationActor } from "frontend/state/authentication"
import { KnownDeviceActor } from "frontend/state/authentication/known-device"
import { UnknownDeviceActor } from "frontend/state/authentication/unknown-device"
import { AuthorizationActor } from "frontend/state/authorization"
import IDPMachine, { IDPMachineType } from "frontend/state/authorization/idp"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { AuthorizeDecider } from "frontend/ui/pages/authorize-decider"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { KnownDeviceCoordinator } from "./known-device"

interface Props {
  machine?: IDPMachineType
  successPath?: string
}

export default function IDPCoordinator({
  machine,
  successPath = `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
}: Props) {
  const [state, , interpreter] = useMachine(machine || IDPMachine)
  const { navigate } = useNFIDNavigate()

  // Handle the completion of the flow
  React.useEffect(() => {
    const watcher = from(interpreter)
    watcher.subscribe((state) => console.log("rxjs", state))
    if (state.done) navigate(successPath)
    // if (state.matches("End")) {
    //     console.log(state.context)
    //     if (!state.context.delegationIdentity || !state.context.sessionKey) {
    //         throw new Error('No sign identity')
    //     }
    //     // Capture user output to global state
    //     setUser({
    //         principal: state.context.delegationIdentity.getPrincipal().toText(),
    //         chain: state.context.delegationIdentity.getDelegation(),
    //         sessionKey: state.context.sessionKey
    //     })
    //     // Go to success page
    //     navigate(successPath)
    // }
  }, [state])

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    case state.matches("AuthorizationMachine"):
      return (
        <AuthorizationCoordinator
          actor={state.children.authorize as AuthorizationActor}
        />
      )
    case state.matches("End"):
      return <Loader isLoading={true} />
    case state.matches("Start"):
    default:
      return <Loader isLoading={true} />
  }
}

function AuthenticationCoordinator({ actor }: Actor<AuthenticationActor>) {
  const [state] = useActor(actor)

  switch (true) {
    case state.matches("KnownDevice"):
      return (
        <KnownDeviceCoordinator
          actor={state.children["known-device"] as KnownDeviceActor}
        />
      )
    case state.matches("UnknownDevice"):
      return (
        <UnknownDeviceCoordinator
          actor={state.children["unknown-device"] as UnknownDeviceActor}
        />
      )
    case state.matches("IsDeviceRegistered"):
    default:
      return <Loader isLoading={true} />
  }
}

function UnknownDeviceCoordinator({ actor }: Actor<UnknownDeviceActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("ExistingAnchor"):
    case state.matches("AuthSelection"):
    case state.matches("AuthWithGoogle"):
      return (
        <AuthorizeDecider
          onSelectRemoteAuthorization={() => send("AUTH_WITH_REMOTE")}
          onSelectSameDeviceRegistration={() =>
            console.log("VOID: SAME DEVICE")
          }
          onSelectSameDeviceAuthorization={() =>
            console.log("VOID: SAME DEVICE AUTHO")
          }
          onSelectGoogleAuthorization={({ credential }) =>
            send({ type: "AUTH_WITH_GOOGLE", data: credential as string })
          }
          onSelectSecurityKeyAuthorization={() =>
            console.log("VOID: SECURITY KEY")
          }
          onToggleAdvancedOptions={() => send("AUTH_WITH_OTHER")}
          showAdvancedOptions={state.matches("ExistingAnchor")}
          isLoading={state.matches("AuthWithGoogle")}
        />
      )
    case state.matches("RegistrationMachine"):
      return <>TODO: RegistrationCoordinator</>
    case state.matches("RemoteAuthentication"):
      return <>TODO: Remote Auth Coordinator</>
    case state.matches("RegisterDeviceDecider"):
      return <>Trust this device?</>
    case state.matches("RegisterDevice"):
      return <>Registering...</>
    case state.matches("RegisterDeviceError"):
      return <>There was an error registering your device</>
    case state.matches("End"):
    case state.matches("Start"):
    default:
      return <Loader isLoading={true} />
  }
}

function AuthorizationCoordinator({ actor }: Actor<AuthorizationActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Unlock"):
    case state.matches("PresentAccounts"):
    case state.matches("Login"):
    case state.matches("FetchAccounts"):
    case state.matches("CreateAccount"):
    case state.matches("GetDelegation"):
      return (
        <ScreenResponsive
          isLoading={
            state.matches("Login") ||
            state.matches("FetchAccounts") ||
            state.matches("CreateAccount") ||
            state.matches("GetDelegation")
          }
          className="flex flex-col items-center"
        >
          <AuthorizeApp
            applicationName=""
            isAuthenticated={
              !!state.context.delegationIdentity || !!state.context.signIdentity
            }
            accounts={state.context?.accounts?.map(mapPersonaToLegacy) || []}
            onUnlockNFID={async () => send("UNLOCK")}
            onLogin={async (persona) =>
              send({ type: "SELECT_ACCOUNT", data: persona })
            }
            onCreateAccount={async () => send("CREATE_ACCOUNT")}
          />
        </ScreenResponsive>
      )
    default:
      return <Loader isLoading={true} />
  }
}
