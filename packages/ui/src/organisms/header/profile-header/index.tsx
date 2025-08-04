import clsx from "clsx"
import { useClickOutside } from "packages/utils/src/index"
import { FC, FunctionComponent, SVGProps, useEffect, useState } from "react"

import {
  IconCmpWarning,
  Loader,
  NFIDLogoMain,
  BurgerMenu,
  NFIDLogo,
} from "@nfid-frontend/ui"

import AuthenticatedPopup from "../navigation-popup"

export enum NFIDTheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export interface INavigationPopupLinks {
  icon: FC<{ strokeColor?: string }> & SVGProps<SVGSVGElement>
  title: string
  link: string
  id: string
  separator?: boolean
}

export interface IProfileHeader extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: number
  isLoading: boolean
  isEmailOutOfSync?: boolean
  syncEmail: () => Promise<void>
  logout: () => void
  links: INavigationPopupLinks[]
  assetsLink: string
  hasVaults: boolean
  profileConstants: {
    base: string
    security: string
    vaults: string
  }
}

export const ProfileHeader: React.FC<IProfileHeader> = ({
  anchor,
  className,
  isLoading,
  isEmailOutOfSync,
  syncEmail,
  logout,
  links,
  assetsLink,
  hasVaults,
  profileConstants,
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [walletTheme, setWalletTheme] = useState<NFIDTheme>(NFIDTheme.SYSTEM)
  const popupRef = useClickOutside(() => setIsMenuVisible(false))

  useEffect(() => {
    const saved = localStorage.getItem("walletTheme") as NFIDTheme | null
    if (saved) {
      setWalletTheme(saved)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      if (walletTheme === NFIDTheme.DARK) {
        root.classList.add("dark")
      } else if (walletTheme === NFIDTheme.LIGHT) {
        root.classList.remove("dark")
      } else if (walletTheme === NFIDTheme.SYSTEM) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }
    }

    applyTheme()
    localStorage.setItem("walletTheme", walletTheme)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (walletTheme === NFIDTheme.SYSTEM) {
        applyTheme()
      }
    }
    mq.addEventListener("change", handleChange)

    return () => mq.removeEventListener("change", handleChange)
  }, [walletTheme])

  return (
    <>
      <div
        className={clsx(
          "w-full h-28 flex justify-between items-center pt-14",
          "md:h-[70px] md:pt-0 mb-[22px]",
          className,
        )}
      >
        <Loader isLoading={isLoading} />
        {walletTheme === NFIDTheme.DARK ? (
          <NFIDLogo />
        ) : (
          <NFIDLogoMain assetsLink={assetsLink} />
        )}

        <div className={clsx("relative")} ref={popupRef} id="profile">
          <BurgerMenu
            isOpened={isMenuVisible}
            onClick={() => setIsMenuVisible(!isMenuVisible)}
            walletTheme={walletTheme}
          />
          {isMenuVisible && (
            <AuthenticatedPopup
              onSignOut={logout}
              anchor={anchor}
              links={links}
              assetsLink={assetsLink}
              hasVaults={hasVaults}
              profileConstants={profileConstants}
              isOpen={isMenuVisible}
              walletTheme={walletTheme}
              setWalletTheme={setWalletTheme}
            />
          )}
        </div>
      </div>
      {isEmailOutOfSync && (
        <div className="px-4 sm:px-[30px] mb-5">
          <div
            className={clsx(
              "px-4 sm:px-[30px] h-[64px] bg-warningBgColor rounded-[12px]",
              "flex items-center",
            )}
          >
            <IconCmpWarning className="text-orange-900 w-[24px] h-[24px] mr-[10px]" />
            <p className="text-sm text-orange-900">
              Your account is out of sync.
            </p>
            <span
              className="ml-auto text-sm font-bold text-orange-900 cursor-pointer hover:opacity-80"
              onClick={() => syncEmail()}
            >
              Re-sync
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileHeader
