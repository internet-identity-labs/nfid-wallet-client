import {
  Button,
  Card,
  CardBody,
  H2,
  Input,
  Loader,
  P,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { nameRules, phoneRules } from "frontend/utils/validations"

interface RegisterAccountCreateNFIDProfileProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface RegisterAccountNFIDState {
  name?: string
  phonenumber?: string
}

export const RegisterAccountCreateNFIDProfile: React.FC<
  RegisterAccountCreateNFIDProfileProps
> = ({ className }) => {
  const { verifyPhonenumber } = useAccount()
  const navigate = useNavigate()
  const {
    register,
    formState: { errors, isValid, dirtyFields },
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    mode: "onTouched",
  })

  const isFormComplete = ["name", "phonenumber"].every(
    (field) => dirtyFields[field],
  )

  const [loading, setLoading] = React.useState(false)

  const { state } = useLocation()

  React.useEffect(() => {
    if (state) {
      const { name, phonenumber } = state as RegisterAccountNFIDState
      name && setValue("name", name)
      phonenumber && setValue("phonenumber", phonenumber)
    }
  }, [setValue, state])

  const handleVerifyPhonenumber = React.useCallback(
    async (data: any) => {
      const { name, phonenumber } = data

      setLoading(true)

      // Backend validation requires trimmed phonenumber
      const trimmedPhonenumber = phonenumber.replace(/\s/g, "")
      const { response, validPhonenumber } = await verifyPhonenumber(
        trimmedPhonenumber,
      )

      if (isValid && validPhonenumber) {
        return navigate(`TODO: replace with new url`, {
          state: {
            name,
            trimmedPhonenumber,
          },
        })
      }
      setError("phonenumber", {
        type: "manual",
        message: response.error,
      })
      setLoading(false)
    },
    [isValid, navigate, setError, verifyPhonenumber],
  )

  return (
    <AppScreen>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12 lg:mt-[56px]">
            <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
              <H2>Your NFID profile</H2>
              <div className="mt-5 mb-8">
                <P className="mb-3">
                  Your name and phone number are the first level of verification
                  that you are an individual person, freeing the Internet from
                  spam and scam accounts.
                </P>

                <P>
                  All your NFID Profile data is encrypted such that only your
                  devices have access.
                </P>
              </div>

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

              <Input
                small
                type="tel"
                className="my-3"
                placeholder="+XXXXXXXXXXX"
                labelText="Phone number"
                errorText={errors.phonenumber?.message}
                helperText="Example: +31 6 123 45 678"
                {...register("phonenumber", {
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
              <div className="mt-8 mb-3">
                <Button
                  large
                  secondary
                  disabled={!isFormComplete || loading}
                  onClick={handleSubmit(handleVerifyPhonenumber)}
                >
                  Verify phone number
                </Button>
                <Loader isLoading={loading} />
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
