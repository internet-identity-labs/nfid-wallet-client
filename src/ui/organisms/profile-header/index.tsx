import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"
import User from "src/assets/userpics/userpic_6.svg"

import { Logo } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { SendReceiveButton } from "frontend/apps/identity-manager/profile/send-receive-button"
import { useAccount } from "frontend/integration/identity-manager/queries"
import { Accordion } from "frontend/ui/atoms/accordion"
import { ButtonMenu } from "frontend/ui/atoms/menu"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import MenuIcon from "./assets/menu.svg"

import AuthenticatedPopup from "../navigation-popup"
import ProfileSidebar from "../profile-sidebar"

interface IProfileHeader extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: number
}

const ProfileHeader: React.FC<IProfileHeader> = ({ className }) => {
  const [isPopupVisible, setIsPopupVisible] = React.useState(false)
  const popupRef = useClickOutside(() => setIsPopupVisible(false))
  const { data: account } = useAccount()
  const { logout } = useAuthentication()
  const navigate = useNavigate()

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
            className={clsx("cursor-pointer w-10")}
            src={User}
            alt="profile icon"
            id="profile"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
          {isPopupVisible && (
            <AuthenticatedPopup
              onSignOut={logout}
              anchor={account?.anchor ?? 0}
            />
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
                "pl-2 pt-20 font-bold bg-white rounded w-[70vw] z-50",
              )}
            >
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
              <ProfileSidebar className="mt-5" />
            </div>
          )}
        </ButtonMenu>
        <SendReceiveButton />
      </div>
    </div>
  )
}

export default ProfileHeader
