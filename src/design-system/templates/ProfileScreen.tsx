import clsx from "clsx"
import React from "react"

import { Logo } from "@internet-identity-labs/nfid-sdk-react"

import { ProfileHomeMenu } from "frontend/design-system/pages/profile/profile-home-menu"

import { ElementProps } from "frontend/types/react"

import { AppScreen } from "./app-screen/AppScreen"

interface ProfileScreenProps extends ElementProps<HTMLDivElement> {}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#a69cff", "#4df1ffa8"],
        bubbleClassNames: [
          "md:top-[40vh] md:left-[10vw]",
          "top-[20vh] left-[27vw] md:top-[60vh] md:left-[10vw]",
        ],
      }}
      navigationItems={
        <div className="flex items-center justify-between w-full md:absolute md:top-7">
          <Logo className="md:ml-4" />
          <ProfileHomeMenu className="md:hidden" />
        </div>
      }
      profileScreen
    >
      <main
        className={clsx(
          "container flex flex-col flex-1 relative max-w-6xl w-full bg-white",
          "sm:mt-0 sm:pt-12",
          "md:px-20 md:ml-auto md:w-2/3",
        )}
      >
        {children}
      </main>
    </AppScreen>
  )
}
