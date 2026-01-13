import { AuthAppMeta } from "@nfid/ui/organisms/authentication/app-meta"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button, IconCmpArrow, IconCmpUserKey, Input } from "@nfid/ui"

import Img from "./sign-up-passkey.png"

export const AuthSignUpCreatePasskey = ({
  onBack,
  applicationURL,
  onCreate,
  isCreating,
  withLogo,
  title,
  subTitle,
  error,
}: {
  onBack: () => void
  applicationURL?: string
  onCreate: (name: string) => void
  isCreating?: boolean
  withLogo?: boolean
  title?: string
  subTitle?: string | JSX.Element
  error?: string
}) => {
  const { register, handleSubmit, formState, setError } = useForm<{
    walletName: string
  }>()

  useEffect(() => {
    if (error) setError("walletName", { message: error })
  }, [error])

  return (
    <div className="flex flex-col flex-grow h-full">
      <IconCmpArrow
        className="absolute w-6 transition-opacity cursor-pointer hover:opacity-50 shrink-0 top-5 left-5 dark:text-white"
        onClick={onBack}
      />
      <AuthAppMeta
        applicationURL={applicationURL}
        withLogo={withLogo}
        title={title}
        subTitle={subTitle}
      />
      <div className="flex flex-col flex-1">
        <img src={Img} className="my-auto" alt="create passkey" />
        <div className="mt-auto">
          <p className="text-center text-sm mb-[10px] dark:text-white">
            Give your wallet a name to easily identify it later (e.g., 'Main
            Wallet' or 'email@address.com’).
          </p>
          <Input
            placeholder="NFID Wallet name"
            className="mb-[10px]"
            errorText={formState.errors.walletName?.message}
            {...register("walletName", { required: "This field is required" })}
          />
          <Button
            className="mt-auto"
            block
            disabled={isCreating}
            onClick={handleSubmit((data) => onCreate(data.walletName))}
            type="primary"
            icon={<IconCmpUserKey />}
          >
            Create wallet with a passkey
          </Button>
        </div>
      </div>
    </div>
  )
}
