import {
  Button,
  Card,
  CardBody,
  H3,
  Input,
  Label,
  Loader,
  P,
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
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
  const { verifyPhonenumber } = useMultipass()
  const navigate = useNavigate()
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    setError,
  } = useForm({
    mode: "all",
  })

  const [loading, setLoading] = React.useState(false)

  const handleVerifyPhonenumber = React.useCallback(
    async (data: any) => {
      const { name, phonenumber } = data

      setLoading(true)

      // Backend validation
      const { validPhonenumber } = await verifyPhonenumber(phonenumber)

      if (isValid && validPhonenumber) {
        return navigate(`${RAC.base}/${RAC.smsVerification}`, {
          state: {
            name,
            phonenumber,
          },
        })
      }
      setError("phonenumber", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      })
      setLoading(false)
    },
    [isValid, navigate, setError, verifyPhonenumber],
  )

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
              <P className="!text-red-400 text-sm">{errors.name?.message}</P>
            </div>
            <div className="my-3">
              <Label>Phone number</Label>
              <Input
                placeholder="+XXXXXXXXXXX"
                {...register("phonenumber", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/[^\d\+]/g, "")
                  },
                  required: phoneRules.errorMessages.required,
                  pattern: {
                    value: phoneRules.regex,
                    message: phoneRules.errorMessages.pattern,
                  },
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
              <P className="!text-red-400 text-sm">
                {errors.phonenumber?.message}
              </P>
            </div>
            <div className="my-3">
              <Button
                large
                block
                filled
                disabled={!isValid || loading}
                onClick={handleSubmit(handleVerifyPhonenumber)}
              >
                Verify phone number
              </Button>
              <Loader isLoading={loading} />
            </div>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
