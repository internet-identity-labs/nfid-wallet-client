import React from "react"

import { ElementProps } from "frontend/types/react"
import { Button } from "frontend/ui/atoms/button"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import MobileHero from "./assets/mobile_hero.svg"

interface AuthorizeAppSingleAccountProps extends ElementProps<HTMLDivElement> {
  applicationLogo?: string
  applicationName?: string
  isLoading: boolean
  loadingMessage?: string | boolean
  onContinueButtonClick: () => Promise<void>
}

export const AuthorizeAppSingleAccount: React.FC<
  AuthorizeAppSingleAccountProps
> = ({
  applicationName,
  onContinueButtonClick,
  applicationLogo,
  isLoading,
  loadingMessage,
}) => {
  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <ApplicationMeta
        applicationLogo={applicationLogo}
        applicationName={applicationName}
        title="Unlock NFID"
        subTitle={`to continue${applicationName && ` to ${applicationName}`}`}
      />
      <img className="w-full max-w-max" src={MobileHero} alt="" />
      <Button className="my-6 " block primary onClick={onContinueButtonClick}>
        Unlock to continue
      </Button>
    </BlurredLoader>
  )
}
