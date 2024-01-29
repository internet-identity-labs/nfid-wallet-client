import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"
import User from "src/assets/userpics/userpic_6.svg"
import useSWRImmutable from "swr/immutable"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { SendReceiveButton } from "frontend/apps/identity-manager/profile/send-receive-button"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Accordion } from "frontend/ui/atoms/accordion"
import { Logo } from "frontend/ui/atoms/images/logo"
import { ButtonMenu } from "frontend/ui/atoms/menu"
import useClickOutside from "frontend/ui/utils/use-click-outside"

import { ReactComponent as MenuIcon } from "./assets/menu.svg"

import AuthenticatedPopup from "../navigation-popup"
import ProfileSidebar from "../profile-sidebar"
import { IconCmpWarning, Loader } from "@nfid-frontend/ui"
import { syncDeviceIIService } from "frontend/features/security/sync-device-ii-service"

interface IProfileHeader extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: number
}

const ProfileHeader: React.FC<IProfileHeader> = ({ className }) => {
  const [isPopupVisible, setIsPopupVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const popupRef = useClickOutside(() => setIsPopupVisible(false))
  const { profile } = useProfile()
  const { logout } = useAuthentication()
  const navigate = useNavigate()
  const {
    data: isEmailDeviceOutOfSyncWithII,
    mutate: refreshIsEmailDeviceOutOfSyncWithII
  } = useSWRImmutable(
    profile?.anchor ? [profile.anchor.toString(), "isEmailDeviceOutOfSyncWithII"] : null,
    syncDeviceIIService.isEmailDeviceOutOfSyncWithII,
  )

  async function syncEmailDeviceWithII(): Promise<void> {
    setIsLoading(true)
    await syncDeviceIIService.syncEmailDeviceWithII()
    await refreshIsEmailDeviceOutOfSyncWithII()
    setIsLoading(false)
  }

  return (
    <div
      className={clsx(
        "w-full h-28 flex justify-between items-center pt-14",
        "md:h-[70px] md:pt-0",
        className,
      )}
    >
      <Loader isLoading={isLoading}/>
      <Logo />
      <div className={clsx("hidden", "md:flex md:space-x-5 md:h-10")}>
        {isEmailDeviceOutOfSyncWithII && (
          <div
            className={clsx(
              "px-2.5 h-10 border border-orange-600 rounded-md",
              "flex items-center",
            )}
          >
            <IconCmpWarning className="text-orange-600 scale-50" />
            <p className="text-sm text-orange-600">
              Your account is out of sync.{" "}
                <span className="font-bold border-b border-orange-600 cursor-pointer hover:opacity-80" onClick={async () => await syncEmailDeviceWithII()}>
                  Re-sync
                </span>
              {" "}
              to restore access.
            </p>
          </div>
        )}
        <SendReceiveButton />
        <div className={clsx("relative")} ref={popupRef} id="profile">
          <img
            className={clsx("cursor-pointer w-10")}
            src={User}
            alt="profile icon"
            onClick={() => setIsPopupVisible(!isPopupVisible)}
          />
          {isPopupVisible && (
            <AuthenticatedPopup
              onSignOut={logout}
              anchor={profile?.anchor ?? 0}
            />
          )}
        </div>
      </div>
      <div className="md:hidden">
        <ButtonMenu
          buttonElement={
            <MenuIcon
              id="mobile-menu"
              className={clsx("transform rotate-180", "md:hidden")}
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
                  <div
                    className="h-[60px] items-center flex p-2.5"
                    id="profile-mobile"
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full shrink-0"
                      onClick={toggleMenu}
                    >
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
                    id="profile-mobile-details"
                  >
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
              <ProfileSidebar id="mobile" className="mt-5" />
            </div>
          )}
        </ButtonMenu>
        <SendReceiveButton />
      </div>
    </div>
  )
}

export default ProfileHeader
