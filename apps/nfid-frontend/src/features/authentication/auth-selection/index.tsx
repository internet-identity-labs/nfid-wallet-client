import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  Button,
  IconCmpGoogle,
  IconCmpPasskey,
  Input,
  SDKFooter,
} from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"
import { authenticationTracking } from "@nfid/integration"

import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"
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
  authRequest?: AuthorizationRequest
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelectGoogleAuth,
  onSelectEmailAuth,
  onSelectOtherAuth,
  onAuthWithPasskey,
  appMeta,
  authRequest,
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  let appHost: string = ""
  try {
    appHost = new URL(authRequest?.hostname ?? "").host
    console.log(authRequest, new URL(authRequest?.hostname ?? "").host)
  } catch (e) {
    appHost = appMeta?.name ?? ""
  }

  return (
    <BlurredLoader
      isLoading={isLoading}
      className="flex flex-col flex-1"
      overlayClassnames="rounded-xl"
      id="auth-selection"
    >
      <AuthAppMeta applicationURL={appHost} />
      <div className="mt-7">
        <form
          onSubmit={handleSubmit((values) => onSelectEmailAuth(values.email))}
          className="space-y-[14px]"
        >
          <Input
            className={SENSITIVE_CONTENT_NO_SESSION_RECORDING}
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
        <Separator className="my-5" />

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
          className="h-12 !p-0 group my-[14px]"
          type="stroke"
          icon={
            <IconCmpPasskey className="text-black group-hover:text-white group-active:text-white group-focus:text-white" />
          }
          block
          onClick={async () => {
            authenticationTracking.initiated({
              authSource: "passkey - continue",
            })
            setIsLoading(true)
            authAbortController.abort("Aborted webauthn manually")
            const abortController = new AbortController()
            const res = await passkeyConnector.loginWithPasskey(
              abortController.signal,
              () => {
                abortController.abort("Aborted loginWithPasskey manually")
                setAuthAbortController(new AbortController())
                setIsLoading(false)
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
      <div className="flex-1" />
      <SDKFooter />
    </BlurredLoader>
  )
}
