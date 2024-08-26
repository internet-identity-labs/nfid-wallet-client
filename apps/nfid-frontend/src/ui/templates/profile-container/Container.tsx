import clsx from "clsx"
import React from "react"

interface IProfileContainer {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
  innerClassName?: string
  id?: string
}

const ProfileContainer: React.FC<IProfileContainer> = ({
  title,
  subTitle,
  children,
  className,
  innerClassName,
  id,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "block border border-gray-200 rounded-[24px]",
        "py-[20px] sm:py-[30px] mb-[30px]",
        className,
      )}
    >
      <div className="px-5">
        {title && (
          <div className="flex items-center justify-between mb-3 text-xl">
            {title}
          </div>
        )}
        {subTitle && (
          <div className="flex items-center justify-between mb-4 text-sm leading-5 text-secondary">
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
