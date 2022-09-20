import clsx from "clsx"
import React from "react"

import { Loader } from "frontend/ui/atoms/loader"
import ProfileHeader from "frontend/ui/organisms/profile-header"
import ProfileSidebar from "frontend/ui/organisms/profile-sidebar"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import ArrowBackIcon from "../assets/arrow-back.svg"

interface IProfileTemplate extends React.HTMLAttributes<HTMLDivElement> {
  pageTitle?: string
  icon?: string
  onBack?: string
  onIconClick?: () => void
  headerClassName?: string
  containerClassName?: string
  isLoading?: boolean
}

const ProfileTemplate: React.FC<IProfileTemplate> = ({
  pageTitle,
  icon,
  onBack,
  onIconClick,
  children,
  className,
  headerClassName,
  containerClassName,
  isLoading = false,
}) => {
  const { navigate } = useNFIDNavigate()
  return (
    <div className={clsx("relative min-h-screen overflow-hidden")}>
      <ProfileHeader className={clsx("px-4 sm:px-[30px]", headerClassName)} />
      <div
        className={clsx(
          "block relative z-1 px-4",
          "sm:gap-[30px] sm:px-[30px]",
          "md:grid md:grid-cols-[50px,1fr]",
          "lg:grid-cols-[256px,1fr]",
          containerClassName,
        )}
      >
        <div className={clsx("hidden mt-5 -ml-3 md:block relative")}>
          <ProfileSidebar id="desktop" />
        </div>
        <section className={clsx("relative overflow-hidden", className)}>
          <div className="flex justify-between h-[70px] items-start mt-5">
            <div className="sticky left-0 flex space-x-2">
              {onBack && (
                <img
                  src={ArrowBackIcon}
                  alt="back"
                  className="transition-all cursor-pointer hover:opacity-70"
                  onClick={() => navigate(onBack)}
                />
              )}
              <p className="text-[28px] block">{pageTitle}</p>
            </div>
            {icon && onIconClick && (
              <img
                src={icon}
                alt="icon"
                onClick={onIconClick}
                className="w-6 h-6 transition-all cursor-pointer hover:opacity-70"
              />
            )}
          </div>
          {children}
        </section>
      </div>
      <Loader isLoading={isLoading} />
    </div>
  )
}

export default ProfileTemplate
