import clsx from "clsx"
import iconClose from "packages/ui/src/atoms/icons/close.svg"
import MenuIcon from "packages/ui/src/atoms/icons/menu.svg"
import { useClickOutside } from "packages/utils/src/index"
import { useState } from "react"

import { IconCmpWarning, Loader, NFIDLogoMain } from "@nfid-frontend/ui"

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
  sendReceiveBtn: JSX.Element
  links: INavigationPopupLinks[]
}

export const ProfileHeader: React.FC<IProfileHeader> = ({
  anchor,
  className,
  isLoading,
  isEmailOutOfSync,
  syncEmail,
  logout,
  sendReceiveBtn,
  links,
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useClickOutside(() => setIsPopupVisible(false))

  return (
    <div
      className={clsx(
        "w-full h-28 flex justify-between items-center pt-14",
        "md:h-[70px] md:pt-0",
        className,
      )}
    >
      <Loader isLoading={isLoading} />
      <NFIDLogoMain />
      <div className={clsx("hidden", "md:flex md:space-x-5 md:h-10")}>
        {isEmailOutOfSync && (
          <div
            className={clsx(
              "px-2.5 h-10 border border-orange-600 rounded-md",
              "flex items-center",
            )}
          >
            <IconCmpWarning className="text-orange-600 scale-50" />
            <p className="text-sm text-orange-600">
              Your account is out of sync.{" "}
              <span
                className="font-bold border-b border-orange-600 cursor-pointer hover:opacity-80"
                onClick={() => syncEmail()}
              >
                Re-sync
              </span>{" "}
              to restore access.
            </p>
          </div>
        )}
      </div>
      <div className={clsx("relative")} ref={popupRef} id="profile">
        <img
          className={clsx("cursor-pointer w-[24px] h-[24px]")}
          src={isPopupVisible ? iconClose : MenuIcon}
          alt="menu icon"
          onClick={() => setIsPopupVisible(!isPopupVisible)}
        />
        {isPopupVisible && (
          <AuthenticatedPopup
            onSignOut={logout}
            anchor={anchor ?? 0}
            links={links}
          />
        )}
      </div>

      <div className="md:hidden absolute">{sendReceiveBtn}</div>
    </div>
  )
}

export default ProfileHeader
