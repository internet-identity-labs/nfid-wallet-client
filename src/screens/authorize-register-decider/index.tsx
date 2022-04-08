import { Button } from "@identity-labs/nfid-sdk-react"
import { RadioButton } from "@identity-labs/nfid-sdk-react"
import { H2, H5 } from "@identity-labs/nfid-sdk-react"
import React from "react"

import { useDeviceInfo } from "frontend/hooks/use-device-info"

interface AuthorizeRegisterDeciderContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onRegister: () => void
  onLogin: () => void
  iframe?: boolean
}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderContentProps
> = ({ children, className, onRegister, onLogin, iframe }) => {
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
