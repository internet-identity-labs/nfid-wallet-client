import React from "react"

interface useTimerProps {
  defaultCounter: number
  loop?: boolean
}

export const useTimer = ({ defaultCounter, loop }: useTimerProps) => {
  const [counter, setCounter] = React.useState(defaultCounter)
  let timer: NodeJS.Timer

  React.useEffect(() => {
    if (counter > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timer = setInterval(() => setCounter(counter - 1), 1000)
    } else {
      loop && setCounter(defaultCounter)
    }

    return () => clearInterval(timer)
  }, [counter, defaultCounter])

  return { counter, setCounter }
}
