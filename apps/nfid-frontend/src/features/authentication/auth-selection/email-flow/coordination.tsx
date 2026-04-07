import { useSelector } from "@xstate/react"
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
  const state = useSelector(actor, (s) => s)
  const send = (event: any) => actor.send(event)

  switch (state.value) {
    case "SendVerificationEmail":
      return <BlurredLoader isLoading />
    case "PendingEmailVerification":
      return (
        <AuthEmailPending
          isIdentityKit={isIdentityKit}
          email={state.context.verificationEmail}
          antiPhishingCode={state.context.antiPhishingCode}
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            send({ type: "RESEND" })
          }}
        />
      )
    case "Error":
      return (
        <AuthEmailError
          onBack={() => send({ type: "BACK" })}
          onResend={() => {
            send({ type: "RESEND" })
          }}
        />
      )
    case "Authenticated":
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
