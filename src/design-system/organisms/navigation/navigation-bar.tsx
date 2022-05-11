import { ImageOnlyLoader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { CONTAINER_CLASSES } from "frontend/design-system/atoms/container"
import { useScroll } from "frontend/hooks/use-scroll"

import { NavigationItems as NavigationItemsDefault } from "./navigation-items"

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationItems?: React.ReactNode
  isFocused?: boolean
  showLogo?: boolean
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  navigationItems,
  isFocused = false,
  showLogo,
}) => {
  const { scrollY } = useScroll()

  return (
    <header
      className={clsx(
        CONTAINER_CLASSES,
        "flex items-center flex-none sticky top-0 z-40 pt-5 pb-9",
        scrollY > 50 && "shadow-gray bg-white",
        scrollY < 50 && "opacity-100 bg-transparent",
      )}
    >
      <div className="flex items-center justify-between">
        {showLogo && (
          <div className="flex items-center ">
            <Link
              to={"/"}
              className="flex items-center w-24 text-2xl font-black"
            >
              <span>NF</span>
              <ImageOnlyLoader className="w-12 h-12" />
            </Link>
          </div>
        )}

        {isFocused ? null : navigationItems ? (
          navigationItems
        ) : (
          <NavigationItemsDefault />
        )}
      </div>
    </header>
  )
}
