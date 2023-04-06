import { clsx } from "clsx"

import { Image } from "@nfid-frontend/ui"

interface IChooseItem {
  handleClick: () => void
  image?: string
  title: string
  subTitle?: string
  innerTitle?: string
  innerSubtitle?: string
  iconClassnames?: string
  id?: string
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
}: IChooseItem) => {
  return (
    <div
      onClick={handleClick}
      className={clsx(
        "border-t border-t-gray-100 last:border-b last:border-b-gray-100 h-[60px]",
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer",
      )}
    >
      <div id={id} className="flex items-center">
        <Image
          src={image}
          alt={title}
          className={clsx("mr-2.5 w-7", iconClassnames, !image && "hidden")}
        />
        <div>
          <p className="text-sm mb-0.5">{title}</p>
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
