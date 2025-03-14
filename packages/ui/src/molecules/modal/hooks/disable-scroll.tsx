import { useEffect, useState } from "react"

export const useDisableScroll = (isActive: boolean) => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.body.clientWidth

    const handleScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop)
    }

    const reset = () => {
      document.body.classList.remove("fixed")
      document.body.style.paddingRight = "0"
      document.body.style.top = "0"
      window.scrollTo(0, scrollY)
    }

    window.addEventListener("scroll", handleScroll)

    if (isActive) {
      document.body.classList.add("fixed")
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.top = `-${scrollY}px`
    } else {
      reset()
    }

    return () => {
      reset()
    }
  }, [isActive])
}
