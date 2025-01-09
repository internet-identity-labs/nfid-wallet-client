import { useAuthentication } from "frontend/apps/authentication/use-authentication"

import { LandingDropdown } from "./landing-dropdown"

export const AuthButton = ({
  isAuthenticated,
  onAuthClick,
}: {
  isAuthenticated: boolean
  onAuthClick: () => void
}) => {
  const { logout } = useAuthentication()

  return (
    <>
      <div className="md:hidden">
        <LandingDropdown
          handler={onAuthClick}
          logoutHandler={logout}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <div
        className="hidden text-white cursor-pointer md:block"
        onClick={onAuthClick}
      >
        <span className="transition-all hover:text-teal-400">
          {isAuthenticated ? "Profile" : "Sign in"}
        </span>
      </div>
    </>
  )
}
