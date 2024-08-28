import clsx from "clsx"
import React from "react"

interface IProfileContainer {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
  innerClassName?: string
  titleClassName?: string
  id?: string
}

const ProfileContainer: React.FC<IProfileContainer> = ({
  title,
  subTitle,
  children,
  className,
  titleClassName,
  innerClassName,
  id,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "block border border-gray-200 rounded-[24px]",
        "py-4 sm:py-[26px] mb-[30px]",
        className,
      )}
    >
      <div className={clsx("px-5", titleClassName)}>
        {title && (
          <div className="flex items-center justify-between mb-[8px] text-xl leading-[34px]">
            {title}
          </div>
        )}
        {subTitle && (
          <div className="flex items-center justify-between mb-5 text-sm leading-[18px] text-secondary">
            {subTitle}
          </div>
        )}
      </div>

      <div className={clsx("px-5 sm:px-[30px]", innerClassName)}>
        {children}
      </div>
    </div>
  )
}

export default ProfileContainer
