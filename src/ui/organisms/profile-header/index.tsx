import clsx from "clsx"
import React from "react"

import { Logo } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { SendReceiveButton } from "frontend/apps/identity-manager/profile/send-receive-button"
import { useAccount } from "frontend/integration/identity-manager/queries"
import { ButtonMenu } from "frontend/ui/atoms/menu"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import MenuIcon from "./assets/menu.svg"
import ProfileIcon from "./assets/profile_img_light.svg"

import ProfileSidebar from "../profile-sidebar"
import ProfileHeaderPopup from "./popup"

interface IProfileHeader extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: number
}

const ProfileHeader: React.FC<IProfileHeader> = ({ className }) => {
  const [isPopupVisible, setIsPopupVisible] = React.useState(false)
  const popupRef = useClickOutside(() => setIsPopupVisible(false))
  const { data } = useAccount()
  const { logout } = useAuthentication()

  return (
    <div
      className={clsx(
        "w-full h-28 flex justify-between items-center pt-14",
        "sm:h-[70px] sm:pt-0",
        className,
      )}
    >
      <Logo />
      <div className={clsx("hidden", "sm:flex sm:space-x-5 sm:h-10")}>
        <SendReceiveButton />
        <div className={clsx("relative")} ref={popupRef}>
          <img
            className={clsx("cursor-pointer")}
            src={ProfileIcon}
            alt="profile icon"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
          {isPopupVisible && (
            <ProfileHeaderPopup onSignOut={logout} anchor={data?.anchor ?? 0} />
          )}
        </div>
      </div>
      <div className="sm:hidden">
        <ButtonMenu
          buttonElement={
            <img
              src={MenuIcon}
              alt="menu"
              className={clsx("transform rotate-180", "sm:hidden")}
            />
          }
        >
          {(toggleMenu) => (
            <div
              className={clsx(
                "pl-2 pt-32 font-bold bg-white rounded w-[70vw] z-50",
              )}
            >
              <ProfileSidebar onSignOut={() => {}} onHelpClick={() => {}} />
            </div>
          )}
        </ButtonMenu>
        <SendReceiveButton />
      </div>
    </div>
  )
}

export default ProfileHeader
