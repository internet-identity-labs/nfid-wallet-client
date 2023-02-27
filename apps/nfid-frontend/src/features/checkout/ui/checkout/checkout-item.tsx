import clsx from "clsx"
import React from "react"

interface ICheckoutItem {
  icon: string
  title: string
  subtitle: string
}

export const CheckoutItem: React.FC<ICheckoutItem> = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className="">
      <div
        className={clsx(
          "flex items-center justify-between overflow-hidden",
          "border rounded-md",
        )}
      >
        <div className="flex items-center">
          <img src={icon} alt={title} />
          <div className="ml-2.5">
            <p className="font-bold tracking-[0.01em] text-base">{title}</p>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
