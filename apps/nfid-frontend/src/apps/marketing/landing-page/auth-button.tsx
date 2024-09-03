import clsx from "clsx"
import { ButtonMenu } from "packages/ui/src/molecules/button/menu"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import User from "frontend/assets/user.svg"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Accordion } from "frontend/ui/atoms/accordion"

import IconMenu from "./assets/menu-white.svg"

import { LandingDropdown } from "./landing-dropdown"

export const AuthButton = ({
  isAuthenticated,
  onAuthClick,
}: {
  isAuthenticated: boolean
  onAuthClick: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [toggleMenu, setToggleMenu] = useState(false)
  const { profile } = useProfile()
  const navigate = useNavigate()
  const { logout } = useAuthentication()

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop
      if (scrollPos > 500) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", onScroll)

    // Cleanup function to remove the event listener
    return () => window.removeEventListener("scroll", onScroll)
  }, []) // Empty dependency array means this effect runs once on mount and clean up on unmount

  return (
    <>
      <div className="md:hidden">
        {isAuthenticated ? (
          <ButtonMenu
            toggleMenu={toggleMenu}
            setToggleMenu={(value) => setToggleMenu(value)}
            buttonElement={
              <img
                src={IconMenu}
                alt="menu"
                className="rotate-180 focus:shadow-none"
                id="burger-mobile"
              />
            }
          >
            {(toggleMenu) => (
              <div
                className={clsx(
                  "font-bold bg-white rounded w-[70vw] pt-[42px]",
                )}
                id="menu-mobile-window"
              >
                <Accordion
                  isBorder={false}
                  style={{ padding: 0 }}
                  detailsClassName="pb-0"
                  title={
                    <div
                      className="h-[60px] items-center flex p-2.5"
                      id="burger-menu-title"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-base shrink-0">
                        <img src={User} alt="user" className="cursor-pointer" />
                      </div>
                      <p className="text-sm text-gray-700 px-2.5 w-full">
                        {profile?.name ?? profile?.anchor ?? ""}
                      </p>
                    </div>
                  }
                  details={
                    <div
                      className="text-sm font-light text-black pl-[60px]"
                      id="burger-menu-details"
                    >
                      <div
                        className="flex items-center h-10"
                        onClick={() => navigate(ProfileConstants.tokens)}
                      >
                        My profile
                      </div>
                      <div className="flex items-center h-10" onClick={logout}>
                        Log out
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </ButtonMenu>
        ) : (
          <LandingDropdown handler={onAuthClick} />
        )}
      </div>
      <div
        className="hidden text-white cursor-pointer md:block"
        onClick={onAuthClick}
      >
        {isScrolled ? (
          <Button> {isAuthenticated ? "Profile" : "Sign in"}</Button>
        ) : (
          <span className="hover:text-[#2DEECB] transition-all">
            {isAuthenticated ? "Profile" : "Sign in"}
          </span>
        )}
      </div>
    </>
  )
}
