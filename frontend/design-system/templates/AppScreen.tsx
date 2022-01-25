import React from "react"
import clsx from "clsx"
import { NavigationHeader } from "frontend/ui-kit/src/index"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  description?: string
  isFocused?: boolean
}

export const AppScreen: React.FC<Props> = ({
  children,
  className,
  title,
  description,
  isFocused = false,
}) => {
  return (
    <div className={clsx("", className)}>
      <div className="flex flex-col mx-auto w-full min-h-screen min-h-screen-ios bg-gray-100">
        {!isFocused && (
          <>
            {/* TODO: BREAKING: */}
            {/* <NavigationBar /> */}
            {title && (
              <NavigationHeader title={title} description={description} />
            )}
          </>
        )}
        <main className="flex flex-1">
          <div className="container xl:max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
