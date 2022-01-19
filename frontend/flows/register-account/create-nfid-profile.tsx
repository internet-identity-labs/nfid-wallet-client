import React from "react"
import clsx from "clsx"
import {
  Button,
  Card,
  CardAction,
  CardBody,
  H3,
  Input,
  Label,
  P,
} from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { RegisterAccountConstants as RAC } from "./routes"

interface RegisterAccountCreateNFIDProfileProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountCreateNFIDProfile: React.FC<
  RegisterAccountCreateNFIDProfileProps
> = ({ children, className }) => {
  const { register, watch } = useForm()
  const navigate = useNavigate()

  const name = watch("name")
  const phonenumber = watch("phonenumber")

  const handleVerifyPhonenumber = React.useCallback(async () => {
    navigate(`${RAC.base}/${RAC.smsVerification}`, {
      state: {
        name,
        phonenumber,
      },
    })
  }, [name, navigate, phonenumber])

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
                {...register("name", { required: true })}
              />
            </div>
            <div className="my-3">
              <Label>Phone number</Label>
              <Input
                placeholder="+XX XXX XXX XX XX"
                {...register("phonenumber", { required: true })}
              />
            </div>
            <div className="my-3">
              <Button
                large
                block
                filled
                disabled={!name || !phonenumber}
                onClick={handleVerifyPhonenumber}
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
