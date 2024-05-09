import { clsx } from "clsx"

import { Badge } from "../../atoms/badge"

interface IChooseItem {
  handleClick: () => void
  image?: string
  title: string
  subTitle?: string
  innerTitle?: string
  innerSubtitle?: string
  iconClassnames?: string
  id?: string
  badgeText?: string
}

export const ChooseItem = ({
  handleClick,
  image,
  title,
  subTitle,
  innerTitle,
  innerSubtitle,
  iconClassnames,
  id,
  badgeText,
}: IChooseItem) => {
  return (
    <div
      id={id}
      onClick={handleClick}
      className={clsx(
        "border-t border-t-gray-100 last:border-b last:border-b-gray-100 h-[60px]",
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer",
        "first:border-t-0",
      )}
    >
      <div id={id} className="flex items-center">
        <img
          src={image}
          alt={title}
          className={clsx("mr-2.5 w-7", iconClassnames, !image && "hidden")}
        />
        <div>
          <p className="text-sm mb-0.5 flex items-center space-x-1">
            <span>{title}</span>
            {badgeText ? <Badge type="success">{badgeText}</Badge> : null}
          </p>
          <p className="text-xs text-gray-400">{subTitle}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-right">{innerTitle}</p>
        <p className="text-xs text-right text-gray-400">{innerSubtitle}</p>
      </div>
    </div>
  )
}
