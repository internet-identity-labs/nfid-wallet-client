import { Loader, NFIDGradientBar } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { NavigationBar } from "../organisms/navigation/navigation-bar"
import { NavigationHeader } from "../organisms/navigation/navigation-header"
import { BubbleOptions, Shell } from "./Shell"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  description?: string
  isFocused?: boolean
  classNameWrapper?: string
  navigationItems?: React.ReactNode
  bubbleOptions?: BubbleOptions
  showLogo?: boolean
  showGradientBar?: boolean
  isLoading?: boolean
  loadingMessage?: string
}

export const AppScreen: React.FC<Props> = ({
  children,
  title,
  description,
  isFocused = false,
  navigationItems,
  bubbleOptions,
  showLogo = false,
  showGradientBar = false,
  isLoading,
  loadingMessage,
}) => {
  return (
    <Shell bubbleOptions={bubbleOptions}>
      <div className="relative flex flex-col w-full min-h-screen mx-auto min-h-screen-ios overflow-clip">
        {showGradientBar && <NFIDGradientBar />}
        <NavigationBar
          navigationItems={navigationItems}
          isFocused={isFocused}
          showLogo={showLogo}
        />
        {title && <NavigationHeader title={title} description={description} />}
        {children}
        {isLoading && (
          <div className="absolute top-0 bottom-0 w-full">
            <div className="absolute top-0 left-0 z-10 w-full h-full bg-white bg-opacity-90 backdrop-blur-sm" />
            <div className="z-20 flex flex-col items-center justify-center w-full h-full px-14">
              <Loader
                iframe
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
    </Shell>
  )
}
