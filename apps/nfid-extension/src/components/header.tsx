import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useProfile } from "frontend/integration/identity-manager/queries"

export function Header() {
  const { logout } = useAuthentication()
  const { profile } = useProfile()
  const navigate = useNavigate()

  return (
    <>
      Anchor: {profile?.anchor}
      <button
        onClick={() => {
          logout()
          navigate("/")
        }}
      >
        Logout
      </button>
    </>
  )
}
