import clsx from "clsx"
import { motion } from "framer-motion"
import { Separator } from "packages/ui/src/atoms/separator"
import { JSX } from "react"
import { useForm } from "react-hook-form"

import {
  BlurredLoader,
  Button,
  IconCmpArrow,
  IconCmpPasskey,
  Input,
} from "@nfid-frontend/ui"
import { ExistingWallet } from "@nfid/integration"

import { AuthAppMeta } from "../app-meta"

export interface AuthSelectionProps {
  onSelectEmailAuth: (email: string) => void
  onSelectOtherAuth?: () => void
  applicationURL?: string
  isIdentityKit?: boolean
  onLoginWithPasskey: () => Promise<void>
  onSignUpWithPasskey: () => void
  wallets?: ExistingWallet[]
  onShowWallets?: () => void
  googleButton: JSX.Element
  iiButton?: JSX.Element
  isLoading: boolean
  passKeySupported?: boolean
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelectEmailAuth,
  onSelectOtherAuth,
  applicationURL,
  isIdentityKit,
  onLoginWithPasskey,
  onSignUpWithPasskey,
  wallets,
  onShowWallets,
  googleButton,
  iiButton,
  isLoading,
  passKeySupported = false,
}) => {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "all",
  })

  const errorMessage =
    formState.errors.email?.type === "required"
      ? "Please enter your email"
      : formState.errors.email?.type === "pattern"
        ? "Email is not valid"
        : undefined

  return (
    <BlurredLoader
      isLoading={isLoading}
      className={clsx("flex flex-col flex-1")}
      overlayClassnames="rounded-[24px]"
      id="auth-selection"
    >
      {!!wallets?.length && onShowWallets && (
        <IconCmpArrow
          onClick={onShowWallets}
          className="absolute cursor-pointer top-5 left-5 dark:text-white"
        />
      )}
      <motion.div
        className="flex flex-col flex-1"
        key="AuthSelection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <AuthAppMeta
          applicationURL={applicationURL}
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Connect to" : undefined}
          subTitle={<>Connect to</>}
        />
        <div className="mt-7">
          <form
            onSubmit={handleSubmit((values) => onSelectEmailAuth(values.email))}
            className="space-y-[10px]"
            noValidate
          >
            <Input
              inputClassName="h-12 rounded-xl"
              placeholder="Email"
              type="email"
              errorText={errorMessage}
              {...register("email", {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
          <div>
            {passKeySupported && (
              <>
                <Button
                  id="passkey-sign-in-button"
                  className="h-12 !p-0 group mt-[10px] active:!text-black dark:active:!text-white mb-2"
                  type="stroke"
                  icon={<IconCmpPasskey />}
                  block
                  onClick={onLoginWithPasskey}
                >
                  Continue with a Passkey
                </Button>
                <Button
                  id="passkey-sign-up-button"
                  className="h-12 !p-0 group mt-[10px] active:!text-black dark:active:!text-white mb-2"
                  type="stroke"
                  icon={<IconCmpPasskey />}
                  block
                  onClick={() => onSignUpWithPasskey()}
                >
                  Create account with a passkey
                </Button>
              </>
            )}
            {googleButton}
            {iiButton && <div className="mt-2">{iiButton}</div>}
            <Button
              id="other-sign-button"
              className="h-12 !p-0 mt-2"
              type="ghost"
              block
              onClick={onSelectOtherAuth}
            >
              Other connection options
            </Button>
          </div>
        </div>
      </motion.div>
    </BlurredLoader>
  )
}
