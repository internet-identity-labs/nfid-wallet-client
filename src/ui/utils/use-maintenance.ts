import { useEffect, useState } from "react"

export const useMaintenance = () => {
  const [isDown, setIsDown] = useState(false)

  useEffect(() => {
    // TODO check II by ii.lookup each 60sec?
    setIsDown(false)
  }, [])

  return {
    isDown,
  }
}
