import React from "react"

import { ElementProps } from "frontend/types/react"
import { Button } from "frontend/ui/atoms/button"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { useMaintenance } from "frontend/ui/utils/use-maintenance"

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
  // TM - Temporary Maintenance
  const { isDown } = useMaintenance()

  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <ApplicationMeta
        applicationLogo={applicationLogo}
        applicationName={applicationName}
        title={!isDown ? "Unlock NFID" : "Scheduled maintenance"}
        subTitle={
          !isDown
            ? `to continue${applicationName && ` to ${applicationName}`}`
            : "Please check back later"
        }
      />
      <img className="w-full max-w-max" src={MobileHero} alt="" />
      <Button
        className="my-6 "
        block
        primary
        onClick={onContinueButtonClick}
        disabled={isDown}
      >
        Unlock to continue
      </Button>
    </BlurredLoader>
  )
}
