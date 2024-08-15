import clsx from "clsx"
import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import Scrollspy from "react-scrollspy"
import User from "src/assets/userpics/userpic_6.svg"

import { loadProfileFromLocalStorage } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import IconMenu from "frontend/apps/marketing/landing-page/assets/menu_close.svg"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { Accordion } from "frontend/ui/atoms/accordion"
import { Button } from "frontend/ui/atoms/button"
import { ButtonMenu } from "frontend/ui/atoms/menu"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import AuthenticatedPopup from "../navigation-popup"

const NAV_ITEMS = [
  {
    label: "The Identity Layer",
    to: "home",
    external: false,
  },
  {
    label: "Only with NFID",
    to: "only-with-nfid",
    external: false,
  },
  {
    label: "Our mission",
    to: "our-mission",
    external: false,
  },
  {
    label: "FAQ",
    to: "faq",
    external: false,
  },
  {
    label: "Docs",
    to: "https://docs.nfid.one",
    external: true,
  },
]
interface NavigationItemsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationItems: React.FC<NavigationItemsProps> = () => {
  const { profile } = useAccount()
  const { isAuthenticated, login, logout } = useAuthentication()

  const navigate = useNavigate()
  const [isPopupVisible, setIsPopupVisible] = React.useState(false)

  const handleLogin = async () => {
    await login()
    navigate(ProfileConstants.tokens)
  }

  const handleLogout = React.useCallback(() => {
    logout()
    setIsPopupVisible(false)
  }, [logout])

  const popupRef = useClickOutside(() => setIsPopupVisible(false))

  const isRegistered = React.useMemo(() => !!loadProfileFromLocalStorage(), [])

  const handleGoTo = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    item: string,
    external: boolean,
  ) => {
    e.preventDefault()
    if (external) window.open(item)
    if (window.location.pathname !== "/") navigate(`/#${item}`)

    const element = document.getElementById(item)

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

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
                        onClick={() => navigate(ProfileConstants.tokens)}
                      >
                        My profile
                      </div>
                      <div
                        className="flex items-center h-10"
                        onClick={() => navigate(`/faq`)}
                      >
                        Help
                      </div>
                      <div className="flex items-center h-10" onClick={logout}>
                        Log out
                      </div>
                    </div>
                  }
                />
              ) : null}
              <div className="flex flex-col px-4 pb-6 ml-1.5 space-y-5 font-bold mt-5">
                {NAV_ITEMS.map((item, index) => (
                  <a
                    href={`/#${encodeURIComponent(item.label)}`}
                    className={clsx(
                      "text-gray-700 text-sm",
                      "hover:underline cursor-pointer hover:text-blue-hover transition-all",
                    )}
                    onClick={(el) => {
                      el.stopPropagation()
                      handleGoTo(el, item.to, item.external)
                      toggleMenu()
                    }}
                    key={index}
                  >
                    {item.label}
                  </a>
                ))}
                <div>
                  {isRegistered && !isAuthenticated ? (
                    <Button
                      id="btn-signin"
                      className={clsx("h-full leading-none")}
                      primary
                      onClick={handleLogin}
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
      <div className={clsx("hidden space-x-10 sm:flex")}>
        <Scrollspy
          className="items-center hidden space-x-10 font-medium md:flex"
          currentClassName="text-black hover:text-black hover:no-underline"
          items={NAV_ITEMS.map((i) => i.to)}
        >
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              to={`/#${encodeURIComponent(item.label)}`}
              className={clsx(
                "text-black hover:underline cursor-pointer hover:text-blue-hover transition-all",
                "text-blue",
              )}
              onClick={(e) => handleGoTo(e, item.to, item.external)}
              key={index}
            >
              {item.label}
            </NavLink>
          ))}
        </Scrollspy>
        <div className="relative" ref={popupRef}>
          {isRegistered && !isAuthenticated ? (
            <Button
              id="btn-signin"
              className={clsx("h-full leading-none")}
              primary
              onClick={handleLogin}
            >
              Sign in
            </Button>
          ) : null}
          {isAuthenticated ? (
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-base"
              onClick={() => setIsPopupVisible(true)}
              id="profile-icon"
            >
              <img src={User} alt="user" className="cursor-pointer" />
            </div>
          ) : null}
          {isPopupVisible && profile?.anchor ? (
            <AuthenticatedPopup
              onSignOut={handleLogout}
              anchor={profile.anchor}
              isLanding
            />
          ) : null}
        </div>
      </div>
    </>
  )
}
