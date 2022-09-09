import clsx from "clsx"
import React from "react"

import NFIDAuthenticationCoordinator from "frontend/coordination/nfid-authentication"
import { ElementProps } from "frontend/types/react"
import { NFIDGradientBar } from "frontend/ui/atoms/gradient-bar"

import Group from "./assets/Group.svg"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isUnregistered?: boolean
  hasAccount?: boolean
}

export const HeroRightSide: React.FC<HeroRightSideProps> = ({
  isUnregistered,
  hasAccount,
}) => {
  console.debug("HeroRightSide", { isUnregistered, hasAccount })

  return isUnregistered ? (
    <div
      className={clsx(
        "relative m-auto sm:block z-10 bg-white p-6 rounded-b-md",
        "mb-[20vh] sm:mb-[60vh] max-w-[360px] drop-shadow-[0_10px_60px_rgba(48,139,245,0.30)]",
        "min-h-[400px]",
      )}
    >
      <NFIDGradientBar className="w-full h-0.5 z-20" rounded={false} />
      <NFIDAuthenticationCoordinator />
      <div className="z-0 bg-white"></div>
    </div>
  ) : hasAccount ? (
    <div className="mb-[75px] sm:mb-[87px] z-10 relative">
      <img src={Group} alt="Group" />
    </div>
  ) : (
    <span></span>
  )
}
