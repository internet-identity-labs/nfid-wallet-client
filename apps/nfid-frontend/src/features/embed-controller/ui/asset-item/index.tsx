import clsx from "clsx"
import React from "react"

import { EmptyAssetPreview } from "./empty"

interface IAssetPreview {
  icon?: string
  title?: string
  subtitle?: string
}

export const AssetPreview: React.FC<IAssetPreview> = ({
  icon,
  title,
  subtitle,
}) => {
  if (!icon && !title) return <EmptyAssetPreview />

  return (
    <div
      className={clsx(
        "flex items-center justify-between overflow-hidden",
        "border rounded-md",
      )}
    >
      <div className="flex items-center">
        <img
          className={clsx("object-cover w-20 h-20", !icon && "hidden")}
          src={icon}
          alt={title}
        />
        <div className={clsx("ml-2.5", !icon && "text-center")}>
          <p className="font-bold tracking-[0.01em] text-base">{title}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
