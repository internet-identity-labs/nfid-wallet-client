import { ImageOnlyLoader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { useScroll } from "frontend/hooks/use-scroll"

import { NavigationItems as NavigationItemsDefault } from "./navigation-items"

interface NavigationBarProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  navigationItems?: React.ReactNode
  isFocused?: boolean
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  children,
  className,
  navigationItems,
  isFocused = false,
}) => {
  const { scrollY } = useScroll()

  return (
    <header
      className={clsx(
        "flex items-center flex-none sticky top-0 transition-all duration-300 z-40",
        scrollY > 50 && "shadow-gray bg-white",
        scrollY < 50 && "opacity-100 bg-transparent",
      )}
    >
      <div className="container px-3 mx-auto">
        <div className="flex items-center justify-between p-3 pr-3">
          <div className="flex items-center">
            <Link
              to={"/"}
              className="flex items-center w-24 text-2xl font-black"
            >
              <span>NF</span>
              <ImageOnlyLoader className="w-12 h-12" />
            </Link>
          </div>

          {isFocused ? null : navigationItems ? (
            navigationItems
          ) : (
            <NavigationItemsDefault />
          )}
        </div>
      </div>
    </header>
  )
}
