import React from "react"

import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { IconButton } from "frontend/design-system/atoms/button/icon-button"
import TouchId from "frontend/design-system/atoms/icons/touch-id.svg"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import "./index.css"

interface RegisterAccountIntroProps {
  onRegister: () => void
  applicationName?: string
  applicationLogo?: string
  isLoading: boolean
}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  onRegister,
  applicationName = "This application",
  applicationLogo,
  isLoading,
}) => {
  return (
    <ScreenResponsive
      className="flex flex-col items-center"
      isLoading={isLoading}
    >
      {applicationLogo && <img src={applicationLogo} alt="" />}
      <H5 className="mt-4">Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you’d like to sign in to {applicationName}
      </p>
      <div className="flex flex-col w-full mt-8 space-y-1">
        <IconButton
          title="Create a new NFID"
          subtitle="Use passkey on this device"
          img={<img src={TouchId} alt="passkey" />}
          onClick={onRegister}
        />
      </div>
    </ScreenResponsive>
  )
}
