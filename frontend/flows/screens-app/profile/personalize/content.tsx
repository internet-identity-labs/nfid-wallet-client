import React from "react"
import clsx from "clsx"
import { Button } from "components/atoms/button"
import { Input } from "components/atoms/input"
import { H2, H5 } from "components/atoms/typography"
import { useMultipass } from "frontend/hooks/use-multipass"
import { P } from "frontend/ui-kit/src"
import { nameRules } from "frontend/utils/validations"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

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
    formState: { errors, isValid, dirtyFields },
    handleSubmit,
  } = useForm({
    mode: "onTouched",
  })

  const isFormComplete = ["name"].every((field) => dirtyFields[field])
  const { updateAccount } = useMultipass()
  const navigate = useNavigate()

  const handlePersonalize = React.useCallback(
    (data: any) => {
      const { name } = data

      updateAccount({
        name,
        skipPersonalize: true,
      })

      // TODO: navigate to the next screen IFrame/AppScreen AuthorizeApp
    },
    [updateAccount],
  )

  const handleSkipPersonalize = React.useCallback(() => {
    updateAccount({
      skipPersonalize: true,
    })

    // TODO: navigate to the next screen IFrame/AppScreen AuthorizeApp
  }, [updateAccount])

  const title = "Personalize your experience"

  return (
    <div className={clsx("", className)}>
      {iframe ? <H5>{title}</H5> : <H2>{title}</H2>}

      <div className="my-5">
        <P className="mb-3">
          Using your name will help you understand which NFID profile you're
          unlocking. You can always change it later on the NFID Account section.
        </P>

        <P>
          Privace and security questions? Visit our{" "}
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

        <div className="mt-5 flex flex-col w-auto">
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
  )
}
