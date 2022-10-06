import clsx from "clsx"
import React from "react"

interface IProfileContainer {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  children?: React.ReactNode
  className?: string
  id?: string
}

const ProfileContainer: React.FC<IProfileContainer> = ({
  title,
  subTitle,
  children,
  className,
  id
}) => {
  return (
    <div
      id={id}
      className={clsx(
        "block border border-gray-200 rounded-xl",
        "px-5 py-4",
        "sm:px-[30px] sm:py-[26px]",
        className,
      )}
    >
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
      {children}
    </div>
  )
}

export default ProfileContainer
