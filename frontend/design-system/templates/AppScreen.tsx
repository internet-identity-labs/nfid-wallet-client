import clsx from "clsx"
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
  className,
  title,
  description,
  isFocused = false,
  classNameWrapper,
  navigationItems,
  bubbleOptions,
}) => {
  return (
    <Shell bubbleOptions={bubbleOptions}>
      <div className="flex flex-col mx-auto w-full min-h-screen min-h-screen-ios">
        {!isFocused && (
          <>
            <NavigationBar navigationItems={navigationItems} />
            {title && (
              <NavigationHeader title={title} description={description} />
            )}
          </>
        )}

        <main className={clsx(classNameWrapper, "flex flex-1 z-50")}>
          <div className="container px-6 py-4 mx-auto">{children}</div>
        </main>
      </div>
    </Shell>
  )
}
