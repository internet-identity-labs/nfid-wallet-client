import { Loader, P } from "@internet-identity-labs/nfid-sdk-react"
import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { Input } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { nameRules } from "frontend/utils/validations"

interface NFIDPersonalizeContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const NFIDPersonalizeContent: React.FC<NFIDPersonalizeContentProps> = ({
  iframe,
  children,
  className,
}) => {
  const {
    register,
    formState: { errors, dirtyFields },
    handleSubmit,
  } = useForm({
    mode: "onTouched",
  })

  const { isLoading, setIsloading } = useIsLoading()
  const isFormComplete = ["name"].every((field) => dirtyFields[field])
  const { identityManager } = useAuthentication()
  const { updateAccount } = useAccount()

  const handlePersonalize = React.useCallback(
    async (data: any) => {
      if (!identityManager) throw new Error("identityManager required")
      setIsloading(true)
      const { name } = data

      await updateAccount(identityManager, {
        name,
        skipPersonalize: true,
      })

      setIsloading(false)
      window.history.back()
    },
    [identityManager, setIsloading, updateAccount],
  )

  const handleSkipPersonalize = React.useCallback(async () => {
    if (!identityManager) throw new Error("identityManager required")
    setIsloading(true)

    await updateAccount(identityManager, {
      skipPersonalize: true,
    })

    setIsloading(false)
    window.history.back()
  }, [identityManager, setIsloading, updateAccount])

  const title = "Personalize your experience"

  return (
    <>
      <div className={clsx("", className)}>
        {iframe ? <H5>{title}</H5> : <H2>{title}</H2>}

        <div className="my-5">
          <P className="mb-3">
            Using your name will help you understand which NFID profile you're
            unlocking. You can always change it later on the NFID Account
            section.
          </P>

          <P>
            Privacy and security questions? Visit our{" "}
            <Link to={"/"} className="text-blue-base">
              FAQ page
            </Link>
            .
          </P>
        </div>

        <div className="md:max-w-[340px]">
          <Input
            small
            className="my-3"
            labelText="Full name"
            errorText={errors.name?.message}
            placeholder="Enter your full name"
            {...register("name", {
              required: nameRules.errorMessages.required,
              pattern: {
                value: nameRules.regex,
                message: nameRules.errorMessages.pattern,
              },
              minLength: {
                value: nameRules.minLength,
                message: nameRules.errorMessages.length,
              },
              maxLength: {
                value: nameRules.maxLength,
                message: nameRules.errorMessages.length,
              },
            })}
          />

          <div className="flex flex-col w-auto mt-5">
            <Button
              block
              secondary
              disabled={!isFormComplete}
              onClick={handleSubmit(handlePersonalize)}
            >
              Personalize
            </Button>
            <Button text block onClick={handleSkipPersonalize}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
    </>
  )
}
