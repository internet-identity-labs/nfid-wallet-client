import React from "react"
import clsx from "clsx"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { H5 } from "components/atoms/typography"
import { Button } from "components/atoms/button"

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
  const {
    make: deviceMake,
    authenticator: platformAuth,
    os,
    browser,
  } = useDeviceInfo()
  return (
    <>
      <H5 className="mb-4 text-center">Log in faster on this device</H5>
      <div>
        <div className="text-center">
          Trust this {deviceMake}? You can quickly and securely log in the next
          time using this device's {platformAuth}.
        </div>

        <div className="py-4 font-bold text-center">
          Do you confirm that this is your {os} and do you trust this {browser}{" "}
          Browser?
        </div>

        <div className="flex items-center justify-center space-x-3">
          <Button largeMax secondary onClick={onRegister}>
            Continue
          </Button>
          <Button stroke largeMax onClick={onLogin}>
            Just log me in
          </Button>
        </div>
      </div>
    </>
  )
}
