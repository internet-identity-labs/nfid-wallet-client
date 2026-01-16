import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"
import sticky from "stickyfilljs"

import { LogoMain } from "@nfid-frontend/ui"

import { CONTAINER_CLASSES } from "@nfid-frontend/ui"
import { useScroll } from "../../utils/use-scroll"

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationItems?: React.ReactNode
  isFocused?: boolean
  showLogo?: boolean
  profileScreen?: boolean
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  navigationItems,
  isFocused = false,
  showLogo,
  profileScreen = false,
}) => {
  const { scrollY } = useScroll()
  const navbar = React.useRef(null)

  React.useEffect(() => {
    navbar.current && sticky.add(navbar.current)
  }, [navbar])

  return (
    <header
      ref={navbar}
      className={clsx(
        "flex-none sticky top-0 z-40 py-5",
        profileScreen && "md:p-0 md:absolute",
        scrollY > 50 && "shadow-gray bg-white",
        scrollY < 50 && "opacity-100 bg-transparent",
      )}
    >
      <div
        className={clsx(!profileScreen ? CONTAINER_CLASSES : "px-5 md:px-16")}
      >
        <div className="flex items-center justify-between">
          {showLogo && (
            <div className="flex items-center ">
              <Link
                to={"/"}
                className="flex items-center w-[162px] text-2xl font-black"
              >
                <img src={LogoMain} alt="NFID Wallet" />
              </Link>
            </div>
          )}

          {isFocused ? null : navigationItems && navigationItems}
        </div>
      </div>
    </header>
  )
}
