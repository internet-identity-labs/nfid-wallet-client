import clsx from "clsx"
import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import Scrollspy from "react-scrollspy"
import User from "src/assets/userpics/userpic_6.svg"

import { Button } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import IconMenu from "frontend/apps/marketing/landing-page/assets/menu_close.svg"
import { useRegisterQRCode } from "frontend/apps/marketing/landing-page/register-qrcode/use-register-qrcode"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"
import { Accordion } from "frontend/ui/atoms/accordion"
import { ButtonMenu } from "frontend/ui/atoms/menu"
import useClickOutside from "frontend/ui/utils/use-click-outside"
import { useScroll } from "frontend/ui/utils/use-scroll"

import { NavigationPopup } from "./auth-popup"

interface NavigationItemsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationItems: React.FC<NavigationItemsProps> = () => {
  const { isAuthenticated, login, logout } = useAuthentication()
  const { getPersona } = usePersona()

  const { account, readAccount } = useAccount()
  const navigate = useNavigate()
  const [isPopupVisible, setIsPopupVisible] = React.useState(false)
  const { registerRoute, status } = useRegisterQRCode()
  const { scrollY } = useScroll()

  const handleLogin = async () => {
    await login()
    await readAccount()
    await getPersona()
    navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
  }

  const popupRef = useClickOutside(() => setIsPopupVisible(false))

  const items = [
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
    // {
    //   label: "Partners",
    //   to: "partners",
    // },
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
            />
          }
        >
          {(toggleMenu) => (
            <div className={clsx("font-bold bg-white rounded w-[70vw] pt-20")}>
              {isAuthenticated ? (
                <Accordion
                  isBorder={false}
                  style={{ padding: 0 }}
                  detailsClassName="pb-0"
                  title={
                    <div className="h-[60px] items-center flex p-2.5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-base shrink-0">
                        <img src={User} alt="user" className="cursor-pointer" />
                      </div>
                      <p className="text-sm text-gray-700 px-2.5 w-full">
                        {account?.name ?? account?.anchor ?? ""}
                      </p>
                    </div>
                  }
                  details={
                    <div className="text-sm font-light text-black-base pl-[60px]">
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
                {items.map((item, index) => (
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
                  {account && !isAuthenticated ? (
                    <Button
                      className={clsx("h-full leading-none")}
                      primary
                      onClick={handleLogin}
                    >
                      Sign in
                    </Button>
                  ) : null}
                  {!account && !isAuthenticated ? (
                    <Button
                      className={"h-full leading-none"}
                      primary
                      onClick={() => navigate(registerRoute)}
                    >
                      Register
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
          currentClassName="text-black-base hover:text-black-base hover:no-underline"
          items={items.map((i) => i.to)}
        >
          {items.map((item, index) => (
            <NavLink
              to={`/#${encodeURIComponent(item.label)}`}
              className={clsx(
                "text-black hover:underline cursor-pointer hover:text-blue-hover transition-all",
                "text-blue-base",
              )}
              onClick={(e) => handleGoTo(e, item.to, item.external)}
              key={index}
            >
              {item.label}
            </NavLink>
          ))}
        </Scrollspy>
        <div className="relative" ref={popupRef}>
          {account && !isAuthenticated ? (
            <Button
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
              onClick={() => setIsPopupVisible(!isPopupVisible)}
              id="profile-icon"
            >
              <img src={User} alt="user" className="cursor-pointer" />
            </div>
          ) : null}
          {!account ? (
            <Button
              className={clsx("h-full leading-none", scrollY < 500 && "hidden")}
              primary
              onClick={() => setIsPopupVisible(!isPopupVisible)}
            >
              Register
            </Button>
          ) : null}
          {isPopupVisible || status !== "" ? <NavigationPopup /> : null}
        </div>
      </div>
    </>
  )
}
