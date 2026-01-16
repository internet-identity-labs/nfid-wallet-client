import { useState, useEffect } from "react"

export const useScroll = () => {
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

  return {
    scrollY,
    scrollDir,
  }
}
