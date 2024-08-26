import { Separator } from "packages/ui/src/atoms/separator"
import { useForm } from "react-hook-form"

import { BlurredLoader, Button, IconCmpPasskey, Input } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"

import { AuthAppMeta } from "../app-meta"

interface AuthorizationRequest {
  hostname?: string
}

interface AuthorizingAppMeta {
  name?: string
}

export interface AuthSelectionProps {
  onSelectEmailAuth: (email: string) => void
  onSelectOtherAuth: () => void
  appMeta?: AuthorizingAppMeta
  authRequest?: AuthorizationRequest
  isIdentityKit?: boolean
  onLoginWithPasskey: () => Promise<void>
  googleButton: JSX.Element
  isLoading: boolean
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelectEmailAuth,
  onSelectOtherAuth,
  appMeta,
  authRequest,
  isIdentityKit,
  onLoginWithPasskey,
  googleButton,
  isLoading,
}) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "onSubmit",
  })
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
      <AuthAppMeta
        applicationURL={appHost}
        withLogo={!isIdentityKit}
        title={isIdentityKit ? "Sign in" : undefined}
        subTitle={<>to continue to</>}
      />
      <div className="mt-7">
        <form
          onSubmit={handleSubmit((values) => onSelectEmailAuth(values.email))}
          className="space-y-[10px]"
        >
          <Input
            className={SENSITIVE_CONTENT_NO_SESSION_RECORDING}
            inputClassName="h-12 rounded-xl"
            placeholder="Email"
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
        <Separator className="my-[10px]" />
        {googleButton}
        <Button
          id="passkey-sign-button"
          className="h-12 !p-0 group my-[10px]"
          type="stroke"
          icon={<IconCmpPasskey />}
          block
          onClick={onLoginWithPasskey}
        >
          Continue with a Passkey
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
    </BlurredLoader>
  )
}
