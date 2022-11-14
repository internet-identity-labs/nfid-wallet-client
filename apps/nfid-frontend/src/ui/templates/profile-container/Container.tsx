import clsx from "clsx"
import React from "react"

interface IProfileContainer {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
  showChildrenPadding?: boolean
  id?: string
}

const ProfileContainer: React.FC<IProfileContainer> = ({
  title,
  subTitle,
  children,
  className,
  showChildrenPadding = true,
  id,
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "block border border-gray-200 rounded-xl",
        "py-4 sm:py-[26px]",
        className,
      )}
    >
      <div className="px-5 sm:px-[30px]">
        {title && (
          <div className="flex items-center justify-between mb-3 text-xl">
            {title}
          </div>
        )}
        {subTitle && (
          <div className="flex items-center justify-between mb-4 text-sm leading-5 text-gray-400">
            {subTitle}
          </div>
        )}
      </div>

      <div className={clsx(showChildrenPadding && "px-5 sm:px-[30px]")}>
        {children}
      </div>
    </div>
  )
}

export default ProfileContainer
