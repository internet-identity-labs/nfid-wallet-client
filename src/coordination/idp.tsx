import { useMachine, useActor } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { mapPersonaToLegacy } from "frontend/integration/identity-manager"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { KnownDeviceActor } from "frontend/state/machines/authentication/known-device"
import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { UnknownDeviceActor } from "frontend/state/machines/authentication/unknown-device"
import { AuthorizationActor } from "frontend/state/machines/authorization/authorization"
import IDPMachine, {
  IDPMachineType,
} from "frontend/state/machines/authorization/idp"
import { AuthorizeApp } from "frontend/ui/pages/authorize-app"
import { AuthorizeDecider } from "frontend/ui/pages/authorize-decider"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { KnownDeviceCoordinator } from "./known-device"
import { RegistrationCoordinator } from "./registration"

interface Props {
  machine?: IDPMachineType
  successPath?: string
}

export default function IDPCoordinator({ machine }: Props) {
  const [state] = useMachine(machine || IDPMachine)

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
      return (
        <RegistrationCoordinator
          actor={state.children.registration as RegistrationActor}
        />
      )
    case state.matches("RemoteAuthentication"):
      return <>TODO: Remote Auth Coordinator</>
    // case state.matches("RegisterDeviceDecider"):
    //   return <>Trust this device?</>
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
