import { Button, Card, CardBody, H3, Input, Label, P } from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { nameRules, phoneRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { RegisterAccountConstants as RAC } from "./routes"

interface RegisterAccountCreateNFIDProfileProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountCreateNFIDProfile: React.FC<
  RegisterAccountCreateNFIDProfileProps
> = ({ children, className }) => {
  const navigate = useNavigate()
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({
    mode: "onBlur",
  })

  const handleVerifyPhonenumber = (data: any) => {
    const { name, phonenumber } = data

    if (isValid) {
      navigate(`${RAC.base}/${RAC.smsVerification}`, {
        state: {
          name,
          phonenumber,
        },
      })
    }
  }

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardBody className="max-w-lg">
          <H3>Your NFID profile</H3>
          <P>
            Your name and phone number are the first level of verification that
            you are an individual person, freeing the Internet from spam and
            scam accounts.
          </P>

          <P className="mt-2">
            All your NFID Profile data is encrypted such that only your devices
            have access.
          </P>

          <div className="my-6">
            <div className="my-3">
              <Label>Full name</Label>
              <Input
                placeholder="Enter your full name"
                {...register("name", {
                  required: nameRules.errorMessages.required,
                  pattern: nameRules.regex,
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
              <P className="text-red-400 text-sm">{errors.name?.message}</P>
            </div>
            <div className="my-3">
              <Label>Phone number</Label>
              <Input
                placeholder="+XXXXXXXXXXX"
                {...register("phonenumber", {
                  required: phoneRules.errorMessages.required,
                  pattern: phoneRules.regex,
                  minLength: {
                    value: phoneRules.minLength,
                    message: phoneRules.errorMessages.length,
                  },
                  maxLength: {
                    value: phoneRules.maxLength,
                    message: phoneRules.errorMessages.length,
                  },
                })}
              />
              <P className="text-red-400 text-sm">
                {errors.phonenumber?.message}
              </P>
            </div>
            <div className="my-3">
              <Button
                large
                block
                filled
                disabled={!isValid}
                onClick={handleSubmit(handleVerifyPhonenumber)}
              >
                Verify phone number
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
