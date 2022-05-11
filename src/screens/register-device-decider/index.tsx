import {
  Button,
  Card,
  CardBody,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import { RadioButton } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

interface RegisterDeviceDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onRegister: () => void
  onLogin: () => void
  iframe?: boolean
}

export const RegisterDeviceDecider: React.FC<RegisterDeviceDeciderProps> = ({
  onRegister,
  onLogin,
  iframe,
}) => {
  const {
    platform: { device, authenticator: platformAuth },
  } = useDeviceInfo()

  const [linkAccount, setLinkAccount] = React.useState(
    "rb_link_account_register",
  )

  const handleClick = () => {
    if (linkAccount === "rb_link_account_register") {
      onRegister()
    }

    if (linkAccount === "rb_link_account_login") {
      onLogin()
    }
  }

  const title = "Log in faster on this device"

  return (
    <>
      {iframe ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      <div>
        Trust this {device}? You can quickly and securely log in the next time
        using this device's {platformAuth}.
      </div>

      <div className="py-5">
        <RadioButton
          checked={linkAccount === "rb_link_account_register"}
          name={"rb_link_account_register"}
          text={"Yes, I trust this device"}
          value={"rb_link_account_register"}
          onChange={() => setLinkAccount("rb_link_account_register")}
        />
        <RadioButton
          checked={linkAccount === "rb_link_account_login"}
          name={"rb_link_account_login"}
          text={"Just log me in"}
          value={"rb_link_account_login"}
          onChange={() => setLinkAccount("rb_link_account_login")}
        />
      </div>

      <div className="mt-6">
        <Button secondary block={iframe} large={!iframe} onClick={handleClick}>
          Continue
        </Button>
      </div>
    </>
  )
}

interface AppScreenRegisterDeviceDeciderProps
  extends RegisterDeviceDeciderProps {
  isLoading: boolean
}

export const AppScreenRegisterDeviceDecider: React.FC<
  AppScreenRegisterDeviceDeciderProps
> = ({ onRegister, onLogin, isLoading }) => (
  <AppScreen isFocused>
    <main className={clsx("flex flex-1")}>
      <div className="container px-6 py-0 mx-auto sm:py-4">
        <Card className="grid grid-cols-12">
          <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
            <RegisterDeviceDecider onRegister={onRegister} onLogin={onLogin} />

            <Loader isLoading={isLoading} fullscreen />
          </CardBody>
        </Card>
      </div>
    </main>
  </AppScreen>
)
