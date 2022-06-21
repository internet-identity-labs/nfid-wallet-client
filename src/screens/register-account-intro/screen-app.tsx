import React from "react"

import { H5 } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"
import { IconButton } from "frontend/design-system/atoms/button/icon-button"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/design-system/atoms/button/signin-with-google"
import TouchId from "frontend/design-system/atoms/icons/touch-id.svg"
import { Separator } from "frontend/design-system/atoms/separator"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import "./index.css"

interface RegisterAccountIntroProps {
  onRegister: () => void
  onSelectGoogleAuthorization: LoginEventHandler
  applicationName?: string
  applicationLogo?: string
  isLoading: boolean
}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  onRegister,
  onSelectGoogleAuthorization,
  applicationName = "this application",
  applicationLogo,
  isLoading,
}) => {
  return (
    <ScreenResponsive
      className="flex flex-col items-center"
      isLoading={isLoading}
    >
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          appliactionName={applicationName}
        />
      )}
      <H5>Sign in</H5>
      <p className="mt-3 text-center">
        Choose how you'd like to sign in to {applicationName}
      </p>
      <div className="flex flex-col w-full mt-8 space-y-1">
        <SignInWithGoogle onLogin={onSelectGoogleAuthorization} />

        <Separator className="max-w-[400px]" />

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
