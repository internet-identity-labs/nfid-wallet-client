import React from "react"

import { Button, H4 } from "@internet-identity-labs/nfid-sdk-react"

import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { ElementProps } from "frontend/types/react"

import MobileHero from "./assets/mobile_hero.svg"

interface AuthorizeAppSingleAccountProps extends ElementProps<HTMLDivElement> {
  applicationLogo: string
  applicationName: string
  onContinueButtonClick: () => Promise<void>
}

export const AuthorizeAppSingleAccount: React.FC<
  AuthorizeAppSingleAccountProps
> = ({ applicationName, onContinueButtonClick, applicationLogo }) => {
  return (
    <ScreenResponsive className="flex flex-col items-center">
      <img src={applicationLogo} alt="logo" />
      <H4 className="mt-4">Unlock NFID</H4>
      <p className="mt-2 text-sm">to continue to {applicationName}</p>
      <img className="w-full max-w-max" src={MobileHero} alt="" />
      <Button className="my-6 " block secondary onClick={onContinueButtonClick}>
        Unlock to continue
      </Button>
    </ScreenResponsive>
  )
}
