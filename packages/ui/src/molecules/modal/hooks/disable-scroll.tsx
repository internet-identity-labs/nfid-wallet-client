import { useEffect, useRef } from "react"

export const useDisableScroll = (isActive: boolean) => {
  const scrollY = useRef(0)

  useEffect(() => {
    if (!isActive) return

    scrollY.current = window.scrollY
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = "hidden"
    document.body.style.height = "100vh"
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.marginTop = `-${scrollY}px`

    return () => {
      document.body.style.overflow = ""
      document.body.style.height = ""
      document.body.style.paddingRight = ""
      document.body.style.marginTop = ""
      window.scrollTo(0, scrollY.current)
    }
  }, [isActive])
}
