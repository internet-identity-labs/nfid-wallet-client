import clsx from "clsx"
import React from "react"

import { Image } from "@nfid-frontend/ui"
import { SDKFooter } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import NFIDAuthenticationCoordinator from "frontend/coordination/nfid-authentication"
import { ElementProps } from "frontend/types/react"

import Group from "./assets/Group.svg"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isUnregistered?: boolean
}

export const NFIDAuthentication: React.FC<HeroRightSideProps> = ({
  isUnregistered,
}) => {
  const { isAuthenticated } = useAuthentication()
  console.debug("HeroRightSide", { isUnregistered, isAuthenticated })

  return isUnregistered ? (
    <div
      className={clsx(
        "relative m-auto sm:block z-10 bg-white rounded-xl overflow-hidden",
        "shadow-screen border border-gray-100",
        "mb-[20vh] sm:mb-[60vh] sm:max-w-[450px]",
        "min-h-[400px]",
        "md:mt-[4rem]",
      )}
    >
      <div className="relative z-10 flex flex-col justify-between w-full h-[580px] p-5">
        <NFIDAuthenticationCoordinator />
        <SDKFooter />
      </div>
    </div>
  ) : (
    <div className="mb-[75px] sm:mb-[87px] z-10 relative">
      <Image src={Group} alt="Group" />
    </div>
  )
}
