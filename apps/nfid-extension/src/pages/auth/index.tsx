import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

import NFIDAuthCoordinator from "../../features/authentication/nfid/coordinator"

export function Auth() {
  const { isAuthenticated } = useAuthentication()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate("/profile")
  }, [isAuthenticated])

  return <NFIDAuthCoordinator />
}
