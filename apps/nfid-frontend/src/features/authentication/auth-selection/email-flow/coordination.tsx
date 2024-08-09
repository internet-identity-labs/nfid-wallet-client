import { useActor } from "@xstate/react"
import { AuthEmailVerified } from "packages/ui/src/organisms/authentication//email-verified"
import { AuthEmailError } from "packages/ui/src/organisms/authentication/error"
import { AuthEmailPending } from "packages/ui/src/organisms/authentication/pending-verification"
import { useEffect } from "react"

import { authenticationTracking, RootWallet } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthWithEmailActor } from "./machine"

interface AuthEmailFlowCoordinatorProps {
  actor: AuthWithEmailActor
}
export function AuthEmailFlowCoordinator({
  actor,
}: AuthEmailFlowCoordinatorProps) {
  const [state, send] = useActor(actor)
  const { profile, isLoading } = useProfile()

  useEffect(() => {
    if (!isLoading && profile && !profile.is2fa) {
      authenticationTracking.completed({
        anchor: profile.anchor,
        legacyUser: profile.wallet === RootWallet.II,
        hasEmail: true,
      })
    }
  }, [profile, isLoading])

  switch (true) {
    case state.matches("SendVerificationEmail"):
      return <BlurredLoader isLoading />
    case state.matches("PendingEmailVerification"):
      return (
        <AuthEmailPending
          email={state.context.verificationEmail}
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            authenticationTracking.magicLinkResendVerification()
            send({ type: "RESEND" })
          }}
        />
      )
    case state.matches("Error"):
      return (
        <AuthEmailError
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            authenticationTracking.magicLinkResendVerification()
            send({ type: "RESEND" })
          }}
        />
      )
    case state.matches("Authenticated"):
      return (
        <AuthEmailVerified
          onContinue={() => send({ type: "CONTINUE_VERIFIED" })}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
