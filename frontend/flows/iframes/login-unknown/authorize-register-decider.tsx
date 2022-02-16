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
  onClick: () => void
}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ onClick }) => {
  const { make: deviceMake, authenticator: platformAuth } = useDeviceInfo()
  return (
    <IFrameScreen logo>
      <H5 className="mb-4">Log in faster on this device</H5>
      <div>
        Trust this {deviceMake}? You can quickly and securely log in the next
        time using this device's {platformAuth}.
      </div>

      <div className="py-5">
        <RadioButton
          name={"link_account"}
          text={"Link existing account"}
          value={"rb_link_account_proceed"}
        />
        <RadioButton
          name={"link_account"}
          text={"No thanks, I'm new"}
          value={"rb_link_account_ignore"}
        />
      </div>

      <div className="mt-6">
        <Button secondary block onClick={onClick}>
          Continue
        </Button>
      </div>
    </IFrameScreen>
  )
}
