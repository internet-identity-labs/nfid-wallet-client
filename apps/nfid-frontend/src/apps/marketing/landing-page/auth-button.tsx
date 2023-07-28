import { useEffect, useState } from "react"

import { Button } from "@nfid-frontend/ui"

export const AuthButton = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop
      if (scrollPos > 500) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", onScroll)

    // Cleanup function to remove the event listener
    return () => window.removeEventListener("scroll", onScroll)
  }, []) // Empty dependency array means this effect runs once on mount and clean up on unmount

  if (isScrolled)
    return <Button> {isAuthenticated ? "Profile" : "Sign in"}</Button>
  return <span> {isAuthenticated ? "Profile" : "Sign in"}</span>
}
