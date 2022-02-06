import React from "react"
import clsx from "clsx"
import { Logo } from "frontend/ui-kit/src"

interface NavigationBarProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  navigationItems?: React.ReactNode
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  children,
  className,
  navigationItems,
}) => {
  return (
    <header className="flex flex-none items-center z-1">
      <div className="container px-6 mx-auto">
        <div className="flex justify-between py-5">
          <div className="flex items-center">
            <Logo nav />
          </div>

          <div>{navigationItems}</div>
        </div>
      </div>
    </header>
  )
}
