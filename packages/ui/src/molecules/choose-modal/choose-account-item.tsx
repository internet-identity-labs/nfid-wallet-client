import { clsx } from "clsx"

import { Badge } from "@nfid/ui/atoms/badge"
import { IconNftPlaceholder } from "@nfid/ui/atoms/icons"
import ImageWithFallback from "@nfid/ui/atoms/image-with-fallback"

interface IChooseAccountItem {
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

export const ChooseAccountItem = ({
  handleClick,
  image,
  title,
  subTitle,
  innerTitle,
  innerSubtitle,
  iconClassnames,
  id,
  badgeText,
}: IChooseAccountItem) => {
  return (
    <div
      id={id}
      onClick={handleClick}
      className={clsx(
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer h-[60px]",
      )}
    >
      <div id={id} className="flex items-center h-[28px]">
        <ImageWithFallback
          alt={title}
          fallbackSrc={IconNftPlaceholder}
          src={image || "#"}
          className={clsx(
            "mr-[18px] w-[28px] h-[28px] object-cover rounded-full",
            iconClassnames,
          )}
        />
        <div>
          <p className="text-sm mb-0.5 flex items-center space-x-1">
            <span className="font-semibold">{title}</span>
            {badgeText ? <Badge type="success">{badgeText}</Badge> : null}
          </p>
          <p className="text-xs text-left text-gray-400">{subTitle}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-right">{innerTitle}</p>
        <p className="text-xs text-right text-gray-400">{innerSubtitle}</p>
      </div>
    </div>
  )
}
