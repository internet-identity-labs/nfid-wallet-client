import { useActor } from "@xstate/react"
import { AuthEmailVerified } from "packages/ui/src/organisms/authentication/email-verified"
import { AuthEmailError } from "packages/ui/src/organisms/authentication/error"
import { AuthEmailPending } from "packages/ui/src/organisms/authentication/pending-verification"

import { BlurredLoader } from "@nfid-frontend/ui"

import { AuthWithEmailActor } from "./machine"

interface AuthEmailFlowCoordinatorProps {
  actor: AuthWithEmailActor
  isIdentityKit?: boolean
}
export function AuthEmailFlowCoordinator({
  actor,
  isIdentityKit = false,
}: AuthEmailFlowCoordinatorProps) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("SendVerificationEmail"):
      return <BlurredLoader isLoading />
    case state.matches("PendingEmailVerification"):
      return (
        <AuthEmailPending
          isIdentityKit={isIdentityKit}
          email={state.context.verificationEmail}
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            send({ type: "RESEND" })
          }}
        />
      )
    case state.matches("Error"):
      return (
        <AuthEmailError
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            send({ type: "RESEND" })
          }}
        />
      )
    case state.matches("Authenticated"):
      return (
        <AuthEmailVerified
          isIdentityKit={isIdentityKit}
          onContinue={() => send({ type: "CONTINUE_VERIFIED" })}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
