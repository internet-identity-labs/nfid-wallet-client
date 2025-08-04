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
        "block border-0 md:border border-gray-200 dark:border-zinc-700 rounded-[24px] relative",
        "py-0 md:py-[30px] mb-[30px]",
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
          <div className="flex items-center justify-between mb-5 text-sm leading-[18px] text-secondary dark:text-zinc-500">
            {subTitle}
          </div>
        )}
      </div>

      <div className={clsx("px-0 md:px-[30px]", innerClassName)}>
        {children}
      </div>
    </div>
  )
}

export default ProfileContainer
