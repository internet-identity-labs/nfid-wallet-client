import clsx from "clsx"
import { useClickOutside } from "packages/utils/src/index"
import { useState } from "react"

import {
  IconCmpWarning,
  Loader,
  NFIDLogoMain,
  IconClose,
  MenuIcon,
} from "@nfid-frontend/ui"

import AuthenticatedPopup from "../navigation-popup"

export interface INavigationPopupLinks {
  icon: string
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
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useClickOutside(() => setIsPopupVisible(false))

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
        <NFIDLogoMain assetsLink={assetsLink} />
        <div className={clsx("relative")} ref={popupRef} id="profile">
          <img
            className={clsx("cursor-pointer w-[24px] h-[24px]")}
            src={isPopupVisible ? IconClose : MenuIcon}
            alt="menu icon"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
          {isPopupVisible && (
            <AuthenticatedPopup
              onSignOut={logout}
              anchor={anchor}
              links={links}
              assetsLink={assetsLink}
              hasVaults={hasVaults}
              profileConstants={profileConstants}
              isOpen={isPopupVisible}
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
