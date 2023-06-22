import { useActor } from "@xstate/react"
import React from "react"

import { Loader } from "@nfid-frontend/ui"

import { AuthEmailFlowCoordinator } from "frontend/features/authentication/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/email-flow/machine"
import { AuthSignIn } from "frontend/features/authentication/ui/signin"
import { AuthWithIIActor } from "frontend/features/sign-in-options/machine"
import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { RemoteReceiverActor } from "frontend/state/machines/authentication/remote-receiver"
import { UnknownDeviceActor } from "frontend/state/machines/authentication/unknown-device"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthWithIICoordinator } from "../features/sign-in-options/coordination"
import { RegistrationCoordinator } from "./registration"
import { RemoteReceiverCoordinator } from "./remote-receiver"

export function UnknownDeviceCoordinator({ actor }: Actor<UnknownDeviceActor>) {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.debug("UnknownDeviceCoordinator", {
        context: state?.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("ExistingAnchor"):
    case state.matches("AuthSelection"):
    case state.matches("AuthWithGoogle"):
    case state.matches("AuthenticateSameDevice"):
      return (
        <AuthSignIn
          onSelectGoogleAuthorization={({ credential }) => {
            console.debug(
              "UnknownDeviceCoordinator onSelectGoogleAuthorization",
              { credential },
            )
            send({
              type: "AUTH_WITH_GOOGLE",
              data: { jwt: credential },
            })
          }}
          onSelectEmailAuthorization={(email: string) =>
            send({
              type: "AUTH_WITH_EMAIL",
              data: email,
            })
          }
        />
        // <AuthorizeDecider
        //   applicationName={state.context.appMeta?.name}
        //   applicationLogo={state.context.appMeta?.logo}
        //   onSelectRemoteAuthorization={() => send("AUTH_WITH_REMOTE")}
        //   onSelectSameDeviceAuthorization={(userNumber) =>
        //     send({
        //       type: "AUTH_WITH_EXISTING_ANCHOR",
        //       data: {
        //         anchor: userNumber,
        //         withSecurityDevices: false,
        //       },
        //     })
        //   }
        //   onSelectSecurityKeyAuthorization={(userNumber) =>
        //     send({
        //       type: "AUTH_WITH_EXISTING_ANCHOR",
        //       data: {
        //         anchor: userNumber,
        //         withSecurityDevices: true,
        //       },
        //     })
        //   }

        //   onSelectIIAuthorization={() => {
        //     send({ type: "AUTH_WITH_II" })
        //   }}
        //   onSelectMetamaskAuthorization={() => {
        //     send({ type: "AUTH_WITH_METAMASK" })
        //   }}
        //   onSelectWConnectAuthorization={() => {
        //     send({ type: "AUTH_WITH_WALLET_CONNECT" })
        //   }}
        //   onToggleAdvancedOptions={() => send("AUTH_WITH_OTHER")}
        //   showAdvancedOptions={state.matches("ExistingAnchor")}
        //   isLoading={
        //     state.matches("AuthWithGoogle") ||
        //     state.matches("AuthenticateSameDevice")
        //   }
        //   // FIXME: doesn't exist on component interface
        //   // loadingMessage={
        //   //   state.matches("AuthWithGoogle")
        //   //     ? "signing in with Google"
        //   //     : undefined
        //   // }
        //   authError={
        //     // TODO cleanup types
        //     "data" in state.event && state.event.data
        //       ? state.event.data.toString()
        //       : undefined
        //   }
        // />
      )
    case state.matches("EmailAuthentication"):
      return (
        <AuthEmailFlowCoordinator
          actor={state.children.authWithEmail as AuthWithEmailActor}
        />
      )
    case state.matches("RegistrationMachine"):
      return (
        <RegistrationCoordinator
          actor={state.children.registration as RegistrationActor}
        />
      )
    case state.matches("RemoteAuthentication"):
      return (
        <RemoteReceiverCoordinator
          actor={state.children.remote as RemoteReceiverActor}
        />
      )
    case state.matches("IIAuthentication"):
      return (
        <BlurredLoader>
          <AuthWithIICoordinator
            actor={state.children.authWithII as AuthWithIIActor}
          />
        </BlurredLoader>
      )
    case state.matches("AuthWithMetamask"):
    case state.matches("AuthWithWalletConnect"):
      return (
        <div className="relative h-[300px] px-24 flex items-center">
          <Loader isLoading fullscreen={false} />
        </div>
      )
    case state.matches("End"):
    case state.matches("Start"):
    default:
      return <BlurredLoader isLoading />
  }
}
