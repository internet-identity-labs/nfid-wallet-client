import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  Button,
  IconCmpGoogle,
  IconCmpPasskey,
  Input,
} from "@nfid-frontend/ui"

import { AbstractAuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/ui/atoms/button/signin-with-google"
import { Separator } from "frontend/ui/atoms/separator"

import { AuthAppMeta } from "../ui/app-meta"
import { passkeyConnector } from "./passkey-flow/services"

export interface AuthSelectionProps {
  onSelectGoogleAuth: LoginEventHandler
  onSelectEmailAuth: (email: string) => void
  onSelectOtherAuth: () => void
  onAuthWithPasskey: (data: AbstractAuthSession) => void
  appMeta?: AuthorizingAppMeta
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelectGoogleAuth,
  onSelectEmailAuth,
  onSelectOtherAuth,
  onAuthWithPasskey,
  appMeta,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "onSubmit",
  })
  const [authAbortController, setAuthAbortController] = useState(
    new AbortController(),
  )

  useEffect(() => {
    passkeyConnector.initPasskeyAutocomplete(
      authAbortController.signal,
      () => setIsLoading(true),
      onAuthWithPasskey,
    )
    return () => {
      authAbortController.abort("Aborted webauthn on unmount")
    }
  }, [authAbortController]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BlurredLoader isLoading={isLoading} className="w-full h-full">
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url}
        applicationName={appMeta?.name}
        title="Continue to your account"
      />
      <div className="space-y-2.5">
        <form
          onSubmit={handleSubmit((values) => onSelectEmailAuth(values.email))}
          className="space-y-2.5"
        >
          <Input
            inputClassName="h-12"
            labelText="Email"
            type="email"
            errorText={formState.errors.email?.message?.toString()}
            {...register("email", {
              required: "Please enter your email",
            })}
            autoComplete="off webauthn"
          />
          <Button
            id="email-sign-button"
            className="h-12 !p-0"
            type="primary"
            block
          >
            Continue with email
          </Button>
        </form>
        <Separator />

        <SignInWithGoogle
          onLogin={onSelectGoogleAuth}
          button={
            <Button
              id="google-sign-button"
              className="h-12 !p-0"
              type="stroke"
              icon={<IconCmpGoogle />}
              block
            >
              Continue with Google
            </Button>
          }
        />
        <Button
          id="passkey-sign-button"
          className="h-12 !p-0"
          type="stroke"
          icon={<IconCmpPasskey />}
          block
          onClick={async () => {
            authAbortController.abort("Aborted webauthn manually")
            const abortController = new AbortController()
            const res = await passkeyConnector.loginWithPasskey(
              abortController.signal,
              () => {
                abortController.abort("Aborted loginWithPasskey manually")
                setAuthAbortController(new AbortController())
              },
            )
            onAuthWithPasskey(res)
          }}
        >
          Continue with a passkey
        </Button>
        <Button
          id="other-sign-button"
          className="h-12 !p-0"
          type="ghost"
          block
          onClick={onSelectOtherAuth}
        >
          Other sign in options
        </Button>
      </div>
    </BlurredLoader>
  )
}
