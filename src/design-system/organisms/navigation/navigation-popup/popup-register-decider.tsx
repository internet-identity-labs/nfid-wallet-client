import {
  Button,
  H5,
  Loader,
  RadioButton,
} from "@internet-identity-labs/nfid-sdk-react"
import React, { useState } from "react"

import logo from "frontend/assets/logo.svg"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface PopupRegisterDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PopupRegisterDecider: React.FC<PopupRegisterDeciderProps> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setStatus } = useRegisterQRCode()
  const { recoverDevice } = useDevices()
  const { readAccount } = useAccount()
  const { setShouldStoreLocalAccount } = useAuthentication()
  const { getPersona } = usePersona()

  const {
    platform: { device, authenticator: platformAuth },
  } = useDeviceInfo()

  const { userNumber } = useUnknownDeviceConfig()

  const [linkAccount, setLinkAccount] = React.useState(
    "rb_link_account_register",
  )

  const handleClick = async () => {
    if (linkAccount === "rb_link_account_register") {
      setIsLoading(true)
      if (!userNumber) {
        return console.error(`Missing userNumber: ${userNumber}`)
      }

      await recoverDevice(userNumber)
      await Promise.all([readAccount(), getPersona()])

      setIsLoading(false)
      setStatus("registerDevice")
    }

    if (linkAccount === "rb_link_account_login") {
      setShouldStoreLocalAccount(false)
      setStatus("")
    }
  }

  React.useEffect(() => {
    if (!window.PublicKeyCredential) setStatus("")
  }, [setStatus])

  return (
    <div>
      <Loader isLoading={isLoading} fullscreen />
      <img src={logo} alt="logo" className="w-20 my-8" />
      <H5 className="mb-4">Log in faster on this device</H5>
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
      <div className="mt-8">
        <Button secondary block large={false} onClick={handleClick}>
          Continue
        </Button>
      </div>
    </div>
  )
}
