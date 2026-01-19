import React from "react"

import { Loader } from "@nfid-frontend/ui"

import { NFIDGradientBar } from "../../atoms/gradient-bar"

import { BlurOverlay } from "../../molecules/blur-overlay"
import { NavigationBar } from "../../organisms/navigation/navigation-bar"
import { NavigationHeader } from "../../organisms/navigation/navigation-header"

interface Props extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  title?: string
  description?: string
  isFocused?: boolean
  classNameWrapper?: string
  navigationItems?: React.ReactNode
  showLogo?: boolean
  showGradientBar?: boolean
  isLoading?: boolean
  loadingMessage?: string
  profileScreen?: boolean
  navigationBar?: boolean
}

export const AppScreen: React.FC<Props> = ({
  children,
  title,
  description,
  isFocused = false,
  navigationItems,
  showLogo = false,
  showGradientBar = false,
  isLoading,
  loadingMessage,
  profileScreen = false,
  navigationBar = true,
}) => {
  return (
    <div className="relative flex flex-col w-full min-h-screen mx-auto overflow-hidden min-h-screen-ios">
      {showGradientBar && <NFIDGradientBar />}
      {navigationBar && (
        <NavigationBar
          navigationItems={navigationItems}
          isFocused={isFocused}
          showLogo={showLogo}
          profileScreen={profileScreen}
        />
      )}
      {title && <NavigationHeader title={title} description={description} />}
      {children}
      {isLoading && (
        <div className="absolute top-0 bottom-0 w-full">
          <BlurOverlay className="absolute top-0 left-0 z-10 w-full h-full" />
          <div className="z-20 flex flex-col items-center justify-center w-full h-full px-14">
            <Loader
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4 z-20"}
            />
            {loadingMessage && (
              <div className="z-20 mt-5 text-center">{loadingMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
