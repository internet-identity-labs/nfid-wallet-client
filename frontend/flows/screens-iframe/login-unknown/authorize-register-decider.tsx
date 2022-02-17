import React from "react"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { H5 } from "components/atoms/typography"
import { Button } from "components/atoms/button"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RadioButton } from "components/atoms/button/radio-button"

interface AuthorizeRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onRegister: () => void
  onLogin: () => void
}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ onRegister, onLogin }) => {
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

  return (
    <IFrameScreen logo>
      <H5 className="mb-4">Log in faster on this device</H5>

      <div>
        Trust this {device}? You can quickly and securely log in the next time
        using this device's {platformAuth}.
      </div>

      <div className="py-5">
        <RadioButton
          checked={linkAccount === "rb_link_account_register"}
          name={"rb_link_account_register"}
          text={"Link existing account"}
          value={"rb_link_account_register"}
          onChange={() => setLinkAccount("rb_link_account_register")}
        />
        <RadioButton
          checked={linkAccount === "rb_link_account_login"}
          name={"rb_link_account_login"}
          text={"No thanks, I'm new"}
          value={"rb_link_account_login"}
          onChange={() => setLinkAccount("rb_link_account_login")}
        />
      </div>

      <div className="mt-6">
        <Button secondary block onClick={handleClick}>
          Continue
        </Button>
      </div>
    </IFrameScreen>
  )
}
