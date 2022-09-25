import clsx from "clsx"
import React from "react"

import NFIDAuthenticationCoordinator from "frontend/coordination/nfid-authentication"
import { ElementProps } from "frontend/types/react"
import { NFIDGradientBar } from "frontend/ui/atoms/gradient-bar"

import Group from "./assets/Group.svg"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isUnregistered?: boolean
}

export const NFIDAuthentication: React.FC<HeroRightSideProps> = ({
  isUnregistered,
}) => {
  console.debug("HeroRightSide", { isUnregistered })

  return isUnregistered ? (
    <div
      className={clsx(
        "relative m-auto sm:block z-10 bg-white rounded-b-md overflow-hidden",
        "mb-[20vh] sm:mb-[60vh] max-w-[360px] shadow-[0_10px_60px_rgba(48,139,245,0.50)]",
        "min-h-[400px]",
        "md:mt-[4rem]",
      )}
    >
      <NFIDGradientBar className="w-full h-0.5 z-20" rounded={false} />
      <div className="relative mt-[2px] flex flex-col w-full h-full">
        <NFIDAuthenticationCoordinator />
      </div>
      <div className={clsx("p-6 text-xs text-gray-400 text-center")}>
        NFID is a privacy-preserving, one-touch multi-factor wallet protocol
        developed by Internet Identity Labs.
      </div>
    </div>
  ) : (
    <div className="mb-[75px] sm:mb-[87px] z-10 relative">
      <img src={Group} alt="Group" />
    </div>
  )
}
