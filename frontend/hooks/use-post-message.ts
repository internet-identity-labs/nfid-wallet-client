import React from "react"

interface usePostMessageProps {
  onMessage: <K extends keyof WindowEventMap>(
    this: Window,
    ev: WindowEventMap[K],
  ) => void
}

export const usePostMessage = ({ onMessage }: usePostMessageProps) => {
  const [opener, setOpener] = React.useState<Window | null>(null)

  const waitForOpener = React.useCallback(async () => {
    const maxTries = 5
    let interval: NodeJS.Timer
    let run: number = 0

    interval = setInterval(() => {
      if (run >= maxTries) {
        clearInterval(interval)
      }
      if (window.opener !== null) {
        setOpener(window.opener)
        clearInterval(interval)
      }
    }, 500)
  }, [])

  React.useEffect(() => {
    waitForOpener()
  }, [waitForOpener])

  React.useEffect(() => {
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [onMessage])

  return { opener }
}
