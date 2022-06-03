import React from "react"

import { Button, H4 } from "@internet-identity-labs/nfid-sdk-react"

import { ApplicationLogo } from "frontend/design-system/atoms/application-logo"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { ElementProps } from "frontend/types/react"

import MobileHero from "./assets/mobile_hero.svg"

interface AuthorizeAppSingleAccountProps extends ElementProps<HTMLDivElement> {
  applicationLogo?: string
  applicationName?: string
  isLoading: boolean
  onContinueButtonClick: () => Promise<void>
}

export const AuthorizeAppSingleAccount: React.FC<
  AuthorizeAppSingleAccountProps
> = ({
  applicationName,
  onContinueButtonClick,
  applicationLogo,
  isLoading,
}) => {
  return (
    <ScreenResponsive
      isLoading={isLoading}
      className="flex flex-col items-center"
    >
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          applicationName={applicationName}
        />
      )}
      <H4 className="mt-4">Unlock NFID</H4>
      <p className="mt-2 text-sm">
        to continue{applicationName && ` to ${applicationName}`}
      </p>
      <img className="w-full max-w-max" src={MobileHero} alt="" />
      <Button className="my-6 " block secondary onClick={onContinueButtonClick}>
        Unlock to continue
      </Button>
    </ScreenResponsive>
  )
}
