import React from "react"
import clsx from "clsx"
import { ImageOnlyLoader, Logo } from "frontend/ui-kit/src"
import { Link } from "react-router-dom"

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
            <Link to={"/"} className="font-black text-2xl flex items-center">
              <span>NF</span>
              <ImageOnlyLoader className="h-12 w-12" />
            </Link>
          </div>

          <div>{navigationItems}</div>
        </div>
      </div>
    </header>
  )
}
