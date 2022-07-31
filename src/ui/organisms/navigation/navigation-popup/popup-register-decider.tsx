import clsx from "clsx"
import React, { useState } from "react"

import {
  Button,
  H5,
  Loader,
  RadioButton,
} from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { useRegisterQRCode } from "frontend/apps/marketing/landing-page/register-qrcode/use-register-qrcode"
import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { authState } from "frontend/integration/internet-identity"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

interface PopupRegisterDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PopupRegisterDecider: React.FC<PopupRegisterDeciderProps> = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setStatus } = useRegisterQRCode()
  const { recoverAccount, createAccount } = useAccount()
  const { setShouldStoreLocalAccount } = useAuthentication()
  const {
    platform: { device, authenticator: platformAuth, os: deviceName },
    browser: { name: browserName },
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
        await recoverAccount(userNumber)
      } catch (e) {
        console.warn("account not found. Recreating")
        await createAccount({ anchor: userNumber })

        // attach the current identity as access point
        const pub_key = Array.from(
          new Uint8Array(
            authState.get()?.delegationIdentity?.getPublicKey().toDer() ?? [],
          ),
        )
        const createAccessPointResponse = await im
          .create_access_point({
            icon: "laptop",
            device: deviceName,
            browser: browserName || "My Computer",
            pub_key,
          })
          .catch((e) => {
            throw new Error(
              `RouterRegisterDeviceDecider.handleRegister im.create_access_point: ${e.message}`,
            )
          })
        if (createAccessPointResponse.status_code !== 200) {
          console.error("failed to create access point", {
            error: createAccessPointResponse.error[0],
          })
        }

        setStatus("registerDevice")
      }
    }
    if (linkAccount === "rb_link_account_login") {
      setShouldStoreLocalAccount(false)
      setStatus("registerDevice")
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
