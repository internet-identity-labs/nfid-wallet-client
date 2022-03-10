import React from "react"

interface useTimerProps {
  defaultCounter: number
  frequency?: number
  loop?: boolean
}

export const useTimer = ({
  defaultCounter,
  loop,
  frequency = 1000,
}: useTimerProps) => {
  const counter = React.useRef(defaultCounter)
  const timer = React.useRef<NodeJS.Timer>()
  const [elapsed, setElapsed] = React.useState(false)

  const handleInterval = React.useCallback(() => {
    if (counter.current > 0) {
      counter.current -= 1
    }

    if (counter.current === 0) {
      setElapsed(true)
      clearInterval(Number(timer.current))
    }

    if (counter.current === 0 && loop) {
      counter.current = defaultCounter
      timer.current = setInterval(handleInterval, frequency)
      setElapsed(false)
    }
  }, [defaultCounter, frequency, loop])

  const setCounter = React.useCallback(
    (value: number) => {
      counter.current = value
    },
    [counter],
  )

  React.useEffect(() => {
    timer.current = setInterval(handleInterval, frequency)
    return () => clearInterval(Number(timer.current))
  }, [frequency, handleInterval])

  const getCounter = React.useCallback(() => counter.current, [counter])

  return { elapsed, setCounter, getCounter }
}
