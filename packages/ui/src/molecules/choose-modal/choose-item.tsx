import { clsx } from "clsx"

import { AssetPreview } from "frontend/integration/nft/impl/nft-types"

import { Badge } from "../../atoms/badge"
import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Skeleton } from "../../atoms/skeleton"

interface IChooseItem {
  handleClick: () => void
  icon?: AssetPreview | null
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
  icon,
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
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer h-[60px]",
        "token-item",
      )}
    >
      <div id={id} className="flex items-center h-[28px]">
        {icon === null ? (
          <Skeleton className="w-12 h-12 mr-[18px] rounded-[12px]" />
        ) : icon?.format === "video" ? (
          <video
            muted
            autoPlay
            loop
            className="w-12 h-12 mr-[18px] rounded-[12px]"
            src={icon.url}
          ></video>
        ) : (
          <ImageWithFallback
            alt={title}
            fallbackSrc={IconNftPlaceholder}
            src={icon?.url || "#"}
            className={clsx(
              "mr-[18px] w-[28px] h-[28px] object-cover rounded-full",
              iconClassnames,
            )}
          />
        )}
        <div>
          <p className="text-sm mb-0.5 flex items-center space-x-1">
            <span className="font-semibold">{title}</span>
            {badgeText ? <Badge type="success">{badgeText}</Badge> : null}
          </p>
          <p className="text-xs text-left text-gray-400">{subTitle}</p>
        </div>
      </div>
      {innerTitle ? (
        <div>
          <p className="text-sm text-right">{innerTitle}</p>
          <p className="text-xs text-right text-gray-400">{innerSubtitle}</p>
        </div>
      ) : (
        <div>
          <Skeleton className="rounded-[6px] h-[20px] w-[80px] mb-[5px]" />
          <Skeleton className="rounded-[6px] h-[16px] w-[60px] ml-auto" />
        </div>
      )}
    </div>
  )
}
