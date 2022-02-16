import React from "react"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { H5 } from "components/atoms/typography"
import { Button } from "components/atoms/button"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

interface AuthorizeRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLogin: () => void
  onRegister: () => void
}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ onLogin, onRegister }) => {
  const { make: deviceMake, authenticator: platformAuth } = useDeviceInfo()
  return (
    <IFrameScreen logo>
      <H5 className="mb-4 text-center">Log in faster on this device</H5>
      <div>
        <div className="text-center">
          Trust this {deviceMake}? You can quickly and securely log in the next
          time using this device's {platformAuth}.
        </div>

        <div className="flex flex-col items-center justify-center mt-6">
          <Button secondary block onClick={onRegister}>
            Continue
          </Button>
          <Button text block onClick={onLogin}>
            Just log me in
          </Button>
        </div>
      </div>
    </IFrameScreen>
  )
}
