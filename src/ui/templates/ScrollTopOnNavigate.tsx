import { useEffect } from "react"

export const ScrollTopOnNavigate = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}
