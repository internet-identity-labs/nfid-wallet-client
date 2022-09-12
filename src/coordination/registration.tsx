import { useActor } from "@xstate/react"
import React from "react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { Captcha } from "frontend/ui/pages/captcha"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"

export function RegistrationCoordinator({ actor }: Actor<RegistrationActor>) {
  const [state, send] = useActor(actor)

  React.useEffect(() => {
    console.debug("RegistrationCoordinator", {
      state: state.value,
      context: state.context,
    })
  }, [state.value, state.context])

  switch (true) {
    case state.matches("Start.Register.CheckAuth"):
    case state.matches("Start.Register.InitialChallenge"):
    case state.matches("Start.Register.CreateIdentity"):
    case state.matches("AuthWithGoogle"):
    case state.matches("ExistingAnchor"):
    case state.matches("AuthenticateSameDevice"):
      return (
        <RegisterAccountIntro
          isLoading={
            state.matches("Start.Register.CheckAuth") ||
            state.matches("Start.Register.CreateIdentity") ||
            state.matches("AuthWithGoogle")
          }
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          onToggleAdvancedOptions={() => {
            // When we're on state ExistingAnchor
            // then the user has clicked back if this method is called
            state.matches("ExistingAnchor")
              ? send("BACK")
              : send("OTHER_SIGNIN_OPTIONS")
          }}
          showAdvancedOptions={
            state.matches("ExistingAnchor") ||
            state.matches("AuthenticateSameDevice")
          }
          onRegister={() => send("CREATE_IDENTITY")}
          onSelectGoogleAuthorization={({ credential }) => {
            console.debug(
              "RegistrationCoordinator onSelectGoogleAuthorization",
              { credential },
            )
            send({
              type: "AUTH_WITH_GOOGLE",
              to: "auth-unknown-device",
              data: { jwt: credential },
            })
          }}
          onSelectSameDeviceAuthorization={(userNumber) =>
            send({
              type: "AUTH_WITH_EXISTING_ANCHOR",
              data: {
                anchor: userNumber,
                withSecurityDevices: false,
              },
            })
          }
          onSelectSecurityKeyAuthorization={(userNumber) =>
            send({
              type: "AUTH_WITH_EXISTING_ANCHOR",
              data: {
                anchor: userNumber,
                withSecurityDevices: true,
              },
            })
          }
          authError={state.context.error}
        />
      )
    case state.matches("Start.Register.Captcha"):
    case state.matches("Start.Register.Register"):
      return (
        <Captcha
          loadingMessage={"Registering NFID"}
          isLoading={state.matches("Start.Register.Register")}
          isChallengeLoading={state.matches("Start.Challenge.Fetch")}
          applicationLogo={state.context.appMeta?.logo}
          applicationName={state.context.appMeta?.name}
          onRegisterAnchor={async ({ captcha }) =>
            send({ type: "SUBMIT_CAPTCHA", data: captcha })
          }
          onRequestNewCaptcha={() => send("FETCH_CAPTCHA")}
          errorString={state.context.error}
          challengeBase64={state.context.challenge?.pngBase64}
        />
      )
    case state.matches("End"):
    default:
      return <BlurredLoader isLoading loadingMessage="Registered successful" />
  }
}
