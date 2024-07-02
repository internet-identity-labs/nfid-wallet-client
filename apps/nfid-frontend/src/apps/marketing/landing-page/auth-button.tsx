import clsx from "clsx"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import User from "frontend/assets/user.svg"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Accordion } from "frontend/ui/atoms/accordion"
import { ButtonMenu } from "frontend/ui/atoms/button/menu"

import IconMenu from "./assets/menu-white.svg"

export const AuthButton = ({
  isAuthenticated,
  onAuthClick,
}: {
  isAuthenticated: boolean
  onAuthClick: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
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
        <ButtonMenu
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
              className={clsx("font-bold bg-white rounded w-[70vw] pt-20")}
              id="menu-mobile-window"
            >
              {isAuthenticated ? (
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
                        onClick={() =>
                          navigate(
                            `${ProfileConstants.base}/${ProfileConstants.assets}`,
                          )
                        }
                      >
                        My profile
                      </div>
                      <div className="flex items-center h-10" onClick={logout}>
                        Log out
                      </div>
                    </div>
                  }
                />
              ) : null}
              <div className="flex flex-col px-4 pb-6 ml-1.5 space-y-5 font-bold mt-5">
                <a
                  href="https://learn.nfid.one/"
                  target="_blank"
                  className={clsx(
                    "text-gray-700 text-sm",
                    "hover:underline cursor-pointer hover:text-blue-hover transition-all",
                  )}
                  rel="noreferrer"
                >
                  Knowledge base
                </a>

                <div>
                  {!isAuthenticated ? (
                    <Button
                      id="btn-signin"
                      className={clsx("h-full leading-none")}
                      type="primary"
                      onClick={onAuthClick}
                    >
                      Sign in
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </ButtonMenu>
      </div>
      <div
        className="hidden cursor-pointer md:block text-white"
        onClick={onAuthClick}
      >
        {isScrolled ? (
          <Button> {isAuthenticated ? "Profile" : "Sign in"}</Button>
        ) : (
          <span> {isAuthenticated ? "Profile" : "Sign in"}</span>
        )}
      </div>
    </>
  )
}
