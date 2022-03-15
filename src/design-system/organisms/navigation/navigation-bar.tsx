import React from "react"
import { Link } from "react-router-dom"

import { ImageOnlyLoader } from "frontend/ui-kit/src"

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
    <header className="flex items-center flex-none z-1">
      <div className="container px-6 mx-auto">
        <div className="flex justify-between py-5">
          <div className="flex items-center">
            <Link to={"/"} className="flex items-center text-2xl font-black">
              <span>NF</span>
              <ImageOnlyLoader className="w-12 h-12" />
            </Link>
          </div>

          <div>{navigationItems}</div>
        </div>
      </div>
    </header>
  )
}
