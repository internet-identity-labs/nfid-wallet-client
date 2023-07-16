import clsx from "clsx"
import React from "react"

import { SDKFooter } from "@nfid-frontend/ui"

import NFIDAuthCoordinator from "frontend/features/authentication/nfid/coordinator"
import { ElementProps } from "frontend/types/react"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isAuthenticated?: boolean
}

export const NFIDAuthentication: React.FC<HeroRightSideProps> = ({
  isAuthenticated,
}) => {
  console.debug("HeroRightSide", { isAuthenticated })

  return (
    <>
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
          <NFIDAuthCoordinator />
          <SDKFooter />
        </div>
      </div>
    </>
  )
}
