/* eslint-disable no-duplicate-case */
import { useActor } from "@xstate/react"
import { AuthEmailVerified } from "packages/ui/src/organisms/authentication/email-verified"
import { AuthEmailError } from "packages/ui/src/organisms/authentication/error"
import { AuthEmailPending } from "packages/ui/src/organisms/authentication/pending-verification"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

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
    case state.matches("Authenticated"):
      return <BlurredLoader isLoading />
    case state.matches("Authenticated"):
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
    case true:
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
