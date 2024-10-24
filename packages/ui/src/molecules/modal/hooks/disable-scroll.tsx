import { useEffect } from "react"

export const useDisableScroll = (isActive: boolean) => {
  useEffect(() => {
    if (!!isActive) {
      document.body.classList.add("fixed")
    } else {
      document.body.classList.remove("fixed")
    }

    return () => {
      document.body.classList.remove("fixed")
    }
  }, [isActive])
}
