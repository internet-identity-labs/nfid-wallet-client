import { useForm } from "react-hook-form"

import { Button, IconCmpGoogle, IconCmpPasskey, Input } from "@nfid-frontend/ui"

import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/ui/atoms/button/signin-with-google"
import { Separator } from "frontend/ui/atoms/separator"

import { AuthAppMeta } from "../app-meta"

export interface AuthSignInProps {
  onSelectGoogleAuthorization: LoginEventHandler
  onSelectEmailAuthorization: (email: string) => void
}

export const AuthSignIn: React.FC<AuthSignInProps> = ({
  onSelectGoogleAuthorization,
  onSelectEmailAuthorization,
}) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "all",
  })

  return (
    <div className="w-full h-full">
      <AuthAppMeta title="Continue to your account" />
      <form
        onSubmit={handleSubmit((values) =>
          onSelectEmailAuthorization(values.email),
        )}
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
        <Separator />

        <SignInWithGoogle
          onLogin={onSelectGoogleAuthorization}
          button={
            <Button
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
          className="h-12 !p-0"
          type="stroke"
          icon={<IconCmpPasskey />}
          block
        >
          Continue with a passkey
        </Button>
        <Button className="h-12 !p-0" type="ghost" block>
          Other sign in options
        </Button>
      </form>
    </div>
  )
}
