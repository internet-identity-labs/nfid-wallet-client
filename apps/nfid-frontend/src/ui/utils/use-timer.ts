import React from "react"

interface useTimerProps {
  defaultCounter: number
  frequency?: number
  loop?: boolean
  onElapsed?: () => void
}

export const useTimer = ({
  defaultCounter,
  loop,
  frequency = 1000,
  onElapsed,
}: useTimerProps) => {
  const [counter, setCounter] = React.useState(defaultCounter)
  const timer = React.useRef<NodeJS.Timer>()
  const [elapsed, setElapsed] = React.useState(false)

  const handleInterval = React.useCallback(() => {
    if (counter > 0) {
      setCounter(counter - 1)
    }

    if (counter === 0) {
      setElapsed(true)
      onElapsed?.()
      clearInterval(Number(timer.current))
    }

    if (counter === 0 && loop) {
      setCounter(defaultCounter)
      timer.current = setInterval(handleInterval, frequency)
      setElapsed(false)
    }
  }, [counter, defaultCounter, frequency, loop, onElapsed])

  React.useEffect(() => {
    timer.current = setInterval(handleInterval, frequency)
    return () => clearInterval(Number(timer.current))
  }, [frequency, handleInterval])

  return { elapsed, setCounter, counter }
}
