import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { ImageOnlyLoader } from "frontend/ui-kit/src"

import { NavigationItems as NavigationItemsDefault } from "./navigation-items"

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
  const [scrollDir, setScrollDir] = useState("")
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const threshold = 0

    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const _scrollY = window.pageYOffset

      if (Math.abs(_scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setScrollDir(_scrollY > lastScrollY ? "down" : "up")
      setScrollY(_scrollY)
      lastScrollY = _scrollY > 0 ? _scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [scrollDir])

  return (
    <header
      className={clsx(
        "flex items-center flex-none z-1 sticky top-0 transition-all duration-300",
        scrollDir === "down" && "shadow-md bg-white/70 backdrop-blur-md",
        scrollDir === "up" && "opacity-0",
        scrollY < 50 && "opacity-100",
      )}
    >
      <div className="container px-3 mx-auto">
        <div className="flex justify-between p-3 items-center pr-3">
          <div className="flex items-center">
            <Link to={"/"} className="flex items-center text-2xl font-black">
              <span>NF</span>
              <ImageOnlyLoader className="w-12 h-12" />
            </Link>
          </div>

          {!navigationItems && <NavigationItemsDefault />}
        </div>
      </div>
    </header>
  )
}
