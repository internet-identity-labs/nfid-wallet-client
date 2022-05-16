import React from "react"

export const useIsIframe = () => {
  const isIframe = React.useMemo(() => {
    return window.top !== window.self
  }, [])
  return isIframe
}
