import { clsx } from "clsx"
import { ReactNode } from "react"

interface IChooseAddressItem {
  handleClick: () => void
  image?: ReactNode
  title: string
  subTitle?: string
  innerTitle?: string
  innerSubtitle?: string
  id?: string
}

export const ChooseAddressItem = ({
  handleClick,
  image,
  title,
  subTitle,
  id,
}: IChooseAddressItem) => {
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
      <div id={id} className="flex items-center justify-center gap-2">
        {image}
        <div>
          <p className="text-sm font-semibold leading-5">{title}</p>
          <p className="text-xs leading-5 text-left text-gray-400 dark:text-zinc-400">
            {subTitle}
          </p>
        </div>
      </div>
    </div>
  )
}
