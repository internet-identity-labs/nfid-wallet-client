import clsx from "clsx"
import ProfileHeader from "packages/ui/src/organisms/header/profile-header"
import { useState, useCallback } from "react"
import useSWRImmutable from "swr/immutable"

import { ArrowButton, Tooltip } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { NavigationPopupLinks } from "frontend/apps/identity-manager/profile/routes"
import { SendReceiveButton } from "frontend/apps/identity-manager/profile/send-receive-button"
import { syncDeviceIIService } from "frontend/features/security/sync-device-ii-service"
import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Loader } from "frontend/ui/atoms/loader"

interface IProfileTemplate extends React.HTMLAttributes<HTMLDivElement> {
  pageTitle?: string
  icon?: string
  showBackButton?: boolean
  onIconClick?: () => void
  headerClassName?: string
  containerClassName?: string
  isLoading?: boolean
  headerMenu?: React.ReactNode
  iconTooltip?: string
  iconId?: string
  className?: string
}

const ProfileTemplate: React.FC<IProfileTemplate> = ({
  pageTitle,
  icon,
  showBackButton,
  onIconClick,
  children,
  className,
  headerClassName,
  containerClassName,
  isLoading = false,
  headerMenu,
  iconTooltip,
  iconId,
}) => {
  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const [isSyncEmailLoading, setIsSyncEmailLoading] = useState(false)
  const { profile } = useProfile()
  const { logout } = useAuthentication()

  const {
    data: isEmailDeviceOutOfSyncWithII,
    mutate: refreshIsEmailDeviceOutOfSyncWithII,
  } = useSWRImmutable(
    profile?.anchor
      ? [profile.anchor.toString(), "isEmailDeviceOutOfSyncWithII"]
      : null,
    syncDeviceIIService.isEmailDeviceOutOfSyncWithII,
  )

  const syncEmailDeviceWithII = async (): Promise<void> => {
    setIsSyncEmailLoading(true)
    await syncDeviceIIService.syncEmailDeviceWithII()
    await refreshIsEmailDeviceOutOfSyncWithII()
    setIsSyncEmailLoading(false)
  }

  return (
    <div className={clsx("relative min-h-screen overflow-hidden", className)}>
      <ProfileHeader
        className={clsx("px-4 sm:px-[30px]", headerClassName)}
        isLoading={isSyncEmailLoading}
        isEmailOutOfSync={isEmailDeviceOutOfSyncWithII}
        syncEmail={syncEmailDeviceWithII}
        anchor={profile?.anchor}
        logout={logout}
        sendReceiveBtn={<SendReceiveButton />}
        links={NavigationPopupLinks}
      />
      <TransferModalCoordinator />
      <div
        className={clsx(
          "relative z-1 px-[16px]",
          "sm:px-[30px]",
          "overflow-auto",
          containerClassName,
        )}
      >
        <section className={clsx("relative", className)}>
          <div className="flex justify-between h-[70px] items-center mt-5">
            <div className="sticky left-0 flex items-center space-x-2">
              {showBackButton && (
                <ArrowButton
                  onClick={handleNavigateBack}
                  iconClassName="text-black"
                />
              )}
              <p className="text-[28px] block" id={"page_title"}>
                {pageTitle}
              </p>
            </div>
            {icon && onIconClick && (
              <Tooltip tip={iconTooltip}>
                <img
                  id={iconId}
                  src={icon}
                  alt="icon"
                  onClick={onIconClick}
                  className="w-6 h-6 transition-all cursor-pointer hover:opacity-70"
                />
              </Tooltip>
            )}
            {headerMenu}
          </div>
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
