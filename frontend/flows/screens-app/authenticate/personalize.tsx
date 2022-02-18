import { Button } from "components/atoms/button"
import { Input } from "components/atoms/input"
import { H2 } from "components/atoms/typography"
import { Card } from "components/molecules/card"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { CardBody, P } from "frontend/ui-kit/src"
import { nameRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

interface NFIDPersonalizeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NFIDPersonalize: React.FC<NFIDPersonalizeProps> = ({
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
      })

      // TODO: navigate to the next screen AuthorizeApp
    },
    [updateAccount],
  )

  return (
    <AppScreen>
      <Card className="grid grid-cols-12 offset-header">
        <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
          <H2>Personalize your experience</H2>
          <div className="my-5">
            <P className="mb-3">
              Using your name will help you understand which NFID profile you're
              unlocking. You can always change it later on the NFID Account
              section.
            </P>

            <P>Privace and security questions? Visit our FAQ page.</P>
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
              <Button text block>
                Skip for now
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
