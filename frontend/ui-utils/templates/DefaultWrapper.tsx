import React from "react"
import clsx from "clsx"
import { NavigationBar } from "../molecules/navigation/navigation-bar"
import { NavigationHeader } from "../molecules/navigation/navigation-header"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  description?: string
}

export const DefaultWrapper: React.FC<Props> = ({
  children,
  className,
  title,
  description,
}) => {
  return (
    <div className={clsx("", className)}>
      <div className="flex flex-col mx-auto w-full min-h-screen bg-gray-100">
        <NavigationBar />
        {title && <NavigationHeader title={title} description={description} />}

        <main className="flex flex-1">
          <div className="container xl:max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
