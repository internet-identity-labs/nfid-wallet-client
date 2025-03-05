import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import { HTMLAttributes, FC } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { IconDisconnect, Skeleton } from "@nfid-frontend/ui"

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
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="AuthenticatedPopup"
          className={clsx(
            "z-40 w-[340px] absolute right-0 top-[30px] bg-white p-[20px]",
            "shadow-xl rounded-[24px] flex flex-col justify-between",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="mb-[16px]">
            <div
              className={clsx(
                "flex items-center justify-center bg-gray-50 h-[50px] rounded-[12px]",
                "text-xs text-gray-500",
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
                  "w-full h-10 text-center border-t border-gray-200 leading-10",
                  "hover:bg-gray-100 cursor-pointer text-sm",
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
                renderLink(linkItem, navigate, location, profileConstants),
              )}
            <div
              id="nav-logout"
              className={clsx(
                "flex items-center gap-[10px] h-[40px] px-[10px] rounded-[12px]",
                "hover:bg-gray-50 cursor-pointer text-sm block text-black font-semibold",
              )}
              onClick={onSignOut}
            >
              <img
                className="w-[20px] h-[20px]"
                src={IconDisconnect}
                alt="nfid navigation"
              />
              Disconnect
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthenticatedPopup
