import { Button, H5, RadioButton } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import logo from "frontend/assets/logo.svg"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

interface PopupRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const PopupRegisterDecider: React.FC<PopupRegisterDeciderProps> = ({
  children,
  className,
}) => {
  const {
    platform: { device, authenticator: platformAuth },
  } = useDeviceInfo()
  const { setStatus } = useRegisterQRCode()

  const [linkAccount, setLinkAccount] = React.useState(
    "rb_link_account_register",
  )

  const handleClick = () => {
    if (linkAccount === "rb_link_account_register") {
      setStatus("registerDevice")
    }

    if (linkAccount === "rb_link_account_login") {
      setStatus("")
    }
  }

  return (
    <div>
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
