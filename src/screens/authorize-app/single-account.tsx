import { Button, H4, P } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { CONTAINER_CLASSES } from "frontend/design-system/atoms/container"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { ElementProps } from "frontend/types/react"

import MobileHero from "./assets/mobile_hero.svg"

interface AuthorizeAppSingleAccountProps extends ElementProps<HTMLDivElement> {
  applicationName: string
  onContinueButtonClick: () => Promise<void>
}

export const AuthorizeAppSingleAccount: React.FC<
  AuthorizeAppSingleAccountProps
> = ({ applicationName, onContinueButtonClick }) => {
  return (
    <AppScreen isFocused showLogo>
      <main className={clsx("flex flex-1")}>
        <div className={clsx(CONTAINER_CLASSES)}>
          <div className="grid h-full grid-cols-12">
            <div className="flex flex-col col-span-12 md:col-span-11 lg:col-span-7">
              <img
                className="max-w-max w-[120%] -ml-[10%]"
                src={MobileHero}
                alt=""
              />
              <div>
                <P className="text-base font-bold text-gray-400">
                  {applicationName}
                </P>
                <H4>Sign in with NFID</H4>
                <Button
                  className="mt-8"
                  largeMax
                  secondary
                  onClick={onContinueButtonClick}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
