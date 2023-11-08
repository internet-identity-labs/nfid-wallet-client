import clsx from "clsx"
import React from "react"

interface IAsset {
  icon?: string
  title?: string
  subtitle?: string
}

export const SingleAssetPreview: React.FC<IAsset> = ({
  icon,
  title,
  subtitle,
}: IAsset) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between overflow-hidden",
        "border rounded-md shrink-0",
      )}
    >
      <div className="flex items-center w-full">
        <img
          className={clsx(
            "object-cover w-20 h-20 rounded-[5px]",
            !icon && "hidden",
          )}
          src={icon}
          alt={title}
        />
        <div
          className={clsx("ml-2.5", !icon && "text-center !ml-0 w-full py-2.5")}
        >
          <p className="font-bold tracking-[0.01em] text-base">{title}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
