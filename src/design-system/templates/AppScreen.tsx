import { NFIDGradientBar } from "@internet-identity-labs/nfid-sdk-react"
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
}

export const AppScreen: React.FC<Props> = ({
  children,
  title,
  description,
  isFocused = false,
  navigationItems,
  bubbleOptions,
}) => {
  return (
    <Shell bubbleOptions={bubbleOptions}>
      <div className="relative flex flex-col w-full min-h-screen mx-auto min-h-screen-ios overflow-clip">
        <NFIDGradientBar />
        <NavigationBar
          navigationItems={navigationItems}
          isFocused={isFocused}
        />
        {title && <NavigationHeader title={title} description={description} />}

        {children}
      </div>
    </Shell>
  )
}
