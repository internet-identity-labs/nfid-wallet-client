import {
  Button,
  H5,
  Loader,
  RadioButton,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"

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
  const { readAndStoreAccount } = useAccount()
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

      try {
        await recoverDevice(userNumber)
        await Promise.all([readAndStoreAccount(), getPersona()])

        setIsLoading(false)
        setStatus("registerDevice")
      } catch (e) {
        console.error(e)
        setIsLoading(false)
      }
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
    <div
      className={clsx(isLoading && "pointer-events-none", "pt-6 px-6 mx-auto")}
    >
      <div
        className={clsx(
          "flex justify-center items-center",
          "absolute top-0 right-0 bottom-0 left-0",
          "w-full h-full bg-gray-900 opacity-[75%] rounded-xl",
          !isLoading && "hidden",
        )}
      >
        <Loader
          imageClasses="w-1/4"
          isLoading={isLoading}
          iframe
          fullscreen={false}
        />
      </div>
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
