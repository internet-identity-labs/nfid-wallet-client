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
  const { make: deviceMake, authenticator: platformAuth } = useDeviceInfo()
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
        Trust this {deviceMake}? You can quickly and securely log in the next
        time using this device's {platformAuth}.
      </div>

      <div className="py-5">
        <RadioButton
          defaultChecked
          name={"link_account"}
          text={"Link existing account"}
          value={"rb_link_account_register"}
          onChange={() => setLinkAccount("rb_link_account_register")}
        />
        <RadioButton
          name={"link_account"}
          text={"No thanks, I'm new"}
          value={"rb_link_account_login"}
          onChange={() => setLinkAccount("rb_link_account_login")}
        />
      </div>

      <div className="mt-6">
        <Button secondary block onClick={() => handleClick()}>
          Continue
        </Button>
      </div>
    </IFrameScreen>
  )
}
