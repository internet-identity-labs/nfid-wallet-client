import { useForm } from "react-hook-form"

import { Button, IconCmpGoogle, IconCmpPasskey, Input } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/ui/atoms/button/signin-with-google"
import { Separator } from "frontend/ui/atoms/separator"

import { AuthAppMeta } from "../ui/app-meta"

export interface AuthSelectionProps {
  onSelectGoogleAuth: LoginEventHandler
  onSelectEmailAuth: (email: string) => void
  onSelectOtherAuth: () => void
  appMeta?: AuthorizingAppMeta
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelectGoogleAuth,
  onSelectEmailAuth,
  onSelectOtherAuth,
  appMeta,
}) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "all",
  })

  return (
    <div className="w-full h-full">
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
          />
          <Button className="h-12 !p-0" type="primary" block>
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
    </div>
  )
}
