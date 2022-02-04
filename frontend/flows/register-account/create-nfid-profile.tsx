import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import {
  Button,
  Card,
  CardBody,
  H2,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import { nameRules, phoneRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { RegisterAccountConstants as RAC } from "./routes"

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
  const { verifyPhonenumber } = useMultipass()
  const navigate = useNavigate()
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    setError,
    setValue,
  } = useForm({
    mode: "all",
  })

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

      // Backend validation
      const { response, validPhonenumber } = await verifyPhonenumber(
        phonenumber,
      )

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
        message: response.error,
      })
      setLoading(false)
    },
    [isValid, navigate, setError, verifyPhonenumber],
  )

  return (
    <AppScreen>
      <Card className="offset-header grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
          <H2>Your NFID profile</H2>
          <div className="mt-5 mb-8">
            <P className="mb-3">
              Your name and phone number are the first level of verification
              that you are an individual person, freeing the Internet from spam
              and scam accounts.
            </P>

            <P>
              All your NFID Profile data is encrypted such that only your
              devices have access.
            </P>
          </div>

          <Input
            small
            autoFocus
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
            className="my-3"
            placeholder="+XXXXXXXXXXX"
            labelText="Phone number"
            errorText={errors.phonenumber?.message}
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
          <div className="mt-8 mb-3">
            <Button
              large
              filled
              disabled={!isValid || loading}
              onClick={handleSubmit(handleVerifyPhonenumber)}
            >
              Verify phone number
            </Button>
            <Loader isLoading={loading} />
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
