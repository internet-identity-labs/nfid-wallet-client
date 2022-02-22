import React, { useState } from "react"
import clsx from "clsx"
import { Button } from "components/atoms/button"
import { Input } from "components/atoms/input"
import { H2, H5 } from "components/atoms/typography"
import { Loader, P } from "frontend/ui-kit/src"
import { nameRules } from "frontend/utils/validations"
import { useForm } from "react-hook-form"
import { generatePath, Link, useNavigate, useParams } from "react-router-dom"
import { IFrameAuthorizeAppConstants as IFrameAuthorizeConstants } from "frontend/flows/screens-iframe/authorize-app/routes"
import { RegisterDevicePromptConstants as AuthorizeConstants } from "../../register-device-prompt/routes"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useLocation } from "react-router-dom"

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
  const params = useParams()
  const { state } = useLocation()
  const {
    register,
    formState: { errors, isValid, dirtyFields },
    handleSubmit,
  } = useForm({
    mode: "onTouched",
  })

  const { isLoading, setIsloading } = useIsLoading()
  const isFormComplete = ["name"].every((field) => dirtyFields[field])
  const { identityManager } = useAuthentication()
  const { updateAccount } = useAccount()
  const navigate = useNavigate()

  const handlePersonalize = React.useCallback(
    async (data: any) => {
      setIsloading(true)
      const { name } = data

      if (!identityManager) throw new Error("identityManager required")

      await updateAccount(identityManager, {
        name,
        skipPersonalize: true,
      })
      setIsloading(false)

      iframe
        ? navigate(`${IFrameAuthorizeConstants.base}`)
        : navigate(`${AuthorizeConstants.base}/${AuthorizeConstants.authorize}`)
    },
    [identityManager, iframe, navigate, setIsloading, updateAccount],
  )

  const handleSkipPersonalize = React.useCallback(async () => {
    iframe
      ? navigate(`${IFrameAuthorizeConstants.base}`)
      : navigate(
          generatePath(
            `${AuthorizeConstants.base}/${AuthorizeConstants.authorize}`,
            params,
          ),
        )
  }, [iframe, navigate, params])

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
