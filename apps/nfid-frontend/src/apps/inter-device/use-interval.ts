import React from "react"

type Poller = (cancel: () => void, totalTries: number) => void

/**
 * @deprecated
 */
export const useInterval = (
  cb: Poller,
  delay: number,
  shouldPoll: boolean = true,
) => {
  const savedCallback = React.useRef<Poller>(() => {})
  const totalTriesRef = React.useRef<number>(0)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const totalTries = React.useCallback(() => totalTriesRef.current, [])
  const resetTries = React.useCallback(() => (totalTriesRef.current = 0), [])

  const stop = React.useCallback(() => {
    intervalRef.current && clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const tick = React.useCallback(() => {
    totalTriesRef.current += 1
    savedCallback.current(stop, totalTries())
  }, [stop, totalTries])

  const start = React.useCallback(() => {
    // Interval already started
    if (intervalRef.current) return

    // Valid delay given
    if (delay !== null) {
      intervalRef.current = setInterval(tick, delay)
    }
  }, [delay, tick])

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = cb
  }, [cb])

  // Set up the interval.
  React.useEffect(() => {
    shouldPoll && start()
    return () => stop()
  }, [delay, shouldPoll, start, stop, tick])
  return { start, stop, totalTries, resetTries }
}
