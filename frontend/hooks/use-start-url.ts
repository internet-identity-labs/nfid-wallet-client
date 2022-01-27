import { atom, useAtom } from "jotai"
import React from "react"

export const startUrlAtom = atom<string | undefined>(undefined)

export const useStartUrl = () => {
  const [startUrl, setStartUrl] = useAtom(startUrlAtom)

  React.useEffect(() => {
    if (!startUrl) {
      setStartUrl(window.location.pathname)
    }
  }, [setStartUrl, startUrl])

  return startUrl
}
