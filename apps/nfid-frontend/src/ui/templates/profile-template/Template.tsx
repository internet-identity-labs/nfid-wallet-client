import clsx from "clsx"
import { HTMLAttributes, useCallback, ReactNode, FC } from "react"

import { ArrowButton, Tooltip } from "@nfid-frontend/ui"

import { TransferModalCoordinator } from "frontend/features/transfer-modal/coordinator"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileHeader from "frontend/ui/organisms/profile-header"
import ProfileSidebar from "frontend/ui/organisms/profile-sidebar"

interface IProfileTemplate extends HTMLAttributes<HTMLDivElement> {
  pageTitle?: string
  icon?: string
  showBackButton?: boolean
  onIconClick?: () => void
  headerClassName?: string
  containerClassName?: string
  isLoading?: boolean
  headerMenu?: ReactNode
  iconTooltip?: string
  iconId?: string
  className?: string
}

const ProfileTemplate: FC<IProfileTemplate> = ({
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

  return (
    <div className={clsx("relative min-h-screen overflow-hidden", className)}>
      <ProfileHeader className={clsx("px-4 sm:px-[30px]", headerClassName)} />
      <TransferModalCoordinator />
      <div
        className={clsx(
          "h-[calc(100vh-70px)] relative z-1 px-4",
          "sm:gap-[30px] sm:px-[30px]",
          "md:grid md:grid-cols-[50px,1fr]",
          "lg:grid-cols-[256px,1fr]",
          "overflow-auto",
          "!block",
          containerClassName,
        )}
      >
        <div className={clsx("hidden mt-5 -ml-3 md:block relative")}>
          <ProfileSidebar id="desktop" />
        </div>
        <section className={clsx("relative", className)}>
          {pageTitle && (
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
          )}
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
