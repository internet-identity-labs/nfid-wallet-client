import clsx from "clsx"
import { motion } from "framer-motion"
import { NavDisconnectIcon } from "packages/ui/src/atoms/icons/nav-disconnect"
import { HTMLAttributes, FC } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { Skeleton } from "@nfid-frontend/ui"

import { NFIDTheme } from "frontend/App"

import darkDarkIcon from "../assets/dark-dark.svg"
import darkIcon from "../assets/dark.svg"
import lightDarkIcon from "../assets/light-dark.svg"
import lightIcon from "../assets/light.svg"
import systemDarkIcon from "../assets/system-dark.svg"
import systemIcon from "../assets/system.svg"
import { INavigationPopupLinks } from "../profile-header"
import { renderLink, shouldRenderLink } from "./renderLinks"

export interface IAuthenticatedPopup extends HTMLAttributes<HTMLDivElement> {
  onSignOut: () => void
  anchor?: number
  isLanding?: boolean
  links: INavigationPopupLinks[]
  assetsLink?: string
  hasVaults?: boolean
  profileConstants?: {
    base: string
    security: string
    vaults: string
  }
  isOpen: boolean
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

export const AuthenticatedPopup: FC<IAuthenticatedPopup> = ({
  anchor,
  onSignOut,
  isLanding = false,
  links,
  assetsLink,
  hasVaults,
  profileConstants,
  isOpen,
  walletTheme,
  setWalletTheme,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      {isOpen && (
        <motion.div
          key="AuthenticatedPopup"
          className={clsx(
            "z-40 w-[340px] absolute right-0 top-[30px] bg-white dark:bg-zinc-800 p-[20px]",
            "shadow-xl rounded-[24px] flex flex-col justify-between",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="flex justify-center mb-2.5 font-semibold text-sm rounded-[12px] p-0.5 bg-gray-100 dark:bg-zinc-900 h-10 dark:text-white">
            <button
              className={clsx(
                "flex-1 flex items-center justify-center gap-[6px] rounded-[10px]",
                walletTheme === NFIDTheme.LIGHT
                  ? "bg-white dark:bg-darkGray"
                  : "bg-transparent",
              )}
              onClick={() => setWalletTheme(NFIDTheme.LIGHT)}
            >
              {walletTheme !== NFIDTheme.LIGHT ? (
                <img src={lightDarkIcon} alt="Light theme" />
              ) : (
                <img src={lightIcon} alt="Light theme" />
              )}
              Light
            </button>
            <button
              className={clsx(
                "flex-1 flex items-center justify-center gap-[6px] rounded-[10px]",
                walletTheme === NFIDTheme.DARK
                  ? "bg-white dark:bg-darkGray"
                  : "bg-transparent",
              )}
              onClick={() => setWalletTheme(NFIDTheme.DARK)}
            >
              {walletTheme !== NFIDTheme.LIGHT ? (
                <img src={darkDarkIcon} alt="Dark theme" />
              ) : (
                <img src={darkIcon} alt="Dark theme" />
              )}
              Dark
            </button>
            <button
              className={clsx(
                "flex-1 flex items-center justify-center gap-[6px] rounded-[10px]",
                walletTheme === NFIDTheme.SYSTEM
                  ? "bg-white dark:bg-darkGray"
                  : "bg-transparent",
              )}
              onClick={() => setWalletTheme(NFIDTheme.SYSTEM)}
            >
              {walletTheme !== NFIDTheme.LIGHT ? (
                <img src={systemDarkIcon} alt="System theme" />
              ) : (
                <img src={systemIcon} alt="System theme" />
              )}
              System
            </button>
          </div>
          <div className="mb-[16px]">
            <div
              className={clsx(
                "flex items-center justify-center bg-gray-50 dark:bg-zinc-900 h-[50px] rounded-[12px]",
                "text-xs text-gray-500 dark:text-zinc-400",
              )}
              id="nfid-anchor"
            >
              NFID number:{" "}
              {anchor || (
                <Skeleton className="h-5 ml-1 w-[72px] rounded-[6px]" />
              )}
            </div>
          </div>
          <div>
            {isLanding ? (
              <div
                className={clsx(
                  "w-full h-10 text-center border-t border-gray-200 dark:border-gray-700 leading-10",
                  "hover:bg-gray-100 dark:hover:bg-red-600 cursor-pointer text-sm",
                )}
                id="#profileButton"
                onClick={() => {
                  if (!assetsLink) return
                  navigate(assetsLink)
                }}
              >
                NFID Profile
              </div>
            ) : null}
            {links
              .filter((linkItem) =>
                shouldRenderLink(
                  linkItem,
                  hasVaults!,
                  location,
                  profileConstants,
                ),
              )
              .map((linkItem) =>
                renderLink(
                  linkItem,
                  navigate,
                  location,
                  walletTheme,
                  profileConstants,
                ),
              )}
            <div
              id="nav-logout"
              className={clsx(
                "flex items-center gap-[10px] h-[40px] px-[10px] rounded-[12px]",
                "hover:bg-gray-50 dark:hover:bg-darkGrayHover/60 cursor-pointer text-sm block text-black dark:text-white font-semibold",
              )}
              onClick={onSignOut}
            >
              <NavDisconnectIcon
                strokeColor={
                  walletTheme !== NFIDTheme.LIGHT ? "white" : "black"
                }
              />
              Disconnect
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default AuthenticatedPopup
