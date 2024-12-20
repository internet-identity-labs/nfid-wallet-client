import { Separator } from "packages/ui/src/atoms/separator"
import { useEffect, useState } from "react"
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
import { ChooseWallet } from "../choose-wallet"

interface AuthorizationRequest {
  hostname?: string
}

interface AuthorizingAppMeta {
  name?: string
}

type WalletState = {
  wallets: ExistingWallet[]
  isChooseWalletLoading: boolean
  isChooseWallet: boolean
}

export interface AuthSelectionProps {
  onSelectEmailAuth: (email: string) => void
  onSelectOtherAuth: () => void
  appMeta?: AuthorizingAppMeta
  authRequest?: AuthorizationRequest
  isIdentityKit?: boolean
  onLoginWithPasskey: () => Promise<void>
  getAllWalletsFromThisDevice: () => Promise<ExistingWallet[]>
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
  getAllWalletsFromThisDevice,
  googleButton,
  isLoading,
}) => {
  const [walletState, setWalletState] = useState<WalletState>({
    wallets: [],
    isChooseWalletLoading: false,
    isChooseWallet: false,
  })
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "" },
    mode: "all",
  })
  let appHost: string = ""
  try {
    appHost = new URL(authRequest?.hostname ?? "").host
    console.log(authRequest, new URL(authRequest?.hostname ?? "").host)
  } catch (e) {
    appHost = appMeta?.name ?? ""
  }

  useEffect(() => {
    setWalletState((prevState) => ({
      ...prevState,
      isChooseWalletLoading: true,
    }))

    getAllWalletsFromThisDevice().then((wallets) => {
      if (!wallets.length) return

      setWalletState({
        wallets,
        isChooseWallet: true,
        isChooseWalletLoading: false,
      })
    })
  }, [])

  const errorMessage =
    formState.errors.email?.type === "required"
      ? "Please enter your email"
      : formState.errors.email?.type === "pattern"
      ? "Email is not valid"
      : undefined

  return (
    <BlurredLoader
      isLoading={isLoading || walletState.isChooseWalletLoading}
      className="flex flex-col flex-1"
      overlayClassnames="rounded-[24px]"
      id="auth-selection"
    >
      {!!walletState.wallets.length && !walletState.isChooseWallet && (
        <IconCmpArrow
          onClick={() =>
            setWalletState((prevState) => ({
              ...prevState,
              isChooseWallet: true,
            }))
          }
          className="absolute cursor-pointer top-5 left-5"
        />
      )}
      {walletState.isChooseWallet ? (
        <ChooseWallet
          authRequest={authRequest}
          appMeta={appMeta}
          showLogo={isIdentityKit}
          onAuthSelection={() =>
            setWalletState((prevState) => ({
              ...prevState,
              isChooseWallet: false,
            }))
          }
          onLoginWithPasskey={onLoginWithPasskey}
          wallets={walletState.wallets}
        />
      ) : (
        <>
          <AuthAppMeta
            applicationURL={appHost}
            withLogo={!isIdentityKit}
            title={isIdentityKit ? "Sign in" : undefined}
            subTitle={<>to continue to</>}
          />
          <div className="mt-7">
            <form
              onSubmit={handleSubmit((values) =>
                onSelectEmailAuth(values.email),
              )}
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
        </>
      )}
    </BlurredLoader>
  )
}
