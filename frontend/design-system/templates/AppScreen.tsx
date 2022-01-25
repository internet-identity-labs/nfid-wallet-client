import React from "react"
import clsx from "clsx"
import { NavigationBar } from "../organisms/navigation/navigation-bar"
import { NavigationHeader } from "../organisms/navigation/navigation-header"

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
      <div className="flex flex-col mx-auto w-full min-h-screen min-h-screen-ios">
        {!isFocused && (
          <>
            <NavigationBar />
            {title && (
              <NavigationHeader title={title} description={description} />
            )}
          </>
        )}
        <main className="flex flex-1">
          <div className="container px-6 py-4 mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
