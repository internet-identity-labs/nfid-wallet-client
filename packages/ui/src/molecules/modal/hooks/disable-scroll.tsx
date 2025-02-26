import { useEffect } from "react"

export const useDisableScroll = (isActive: boolean) => {
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.body.clientWidth

    const reset = () => {
      document.body.classList.remove("fixed")
      document.body.style.paddingRight = "0"
    }

    if (isActive) {
      document.body.classList.add("fixed")
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      reset()
    }

    return () => {
      reset()
    }
  }, [isActive])
}
