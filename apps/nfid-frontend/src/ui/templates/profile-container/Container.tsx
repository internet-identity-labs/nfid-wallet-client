import clsx from "clsx"
import React from "react"

interface IProfileContainer {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
  showChildrenPadding?: boolean
  id?: string
  isActivity?: boolean
}

const ProfileContainer: React.FC<IProfileContainer> = ({
  title,
  subTitle,
  children,
  className,
  showChildrenPadding = true,
  id,
  isActivity,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "block border border-gray-200 rounded-xl",
        "py-4 sm:py-[26px]",
        isActivity && "pb-0",
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

      <div
        className={clsx(
          showChildrenPadding && "px-5 sm:px-[30px]",
          isActivity && "px-0 sm:px-[30px]",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default ProfileContainer
