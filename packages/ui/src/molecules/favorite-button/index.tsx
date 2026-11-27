import clsx from "clsx"
import { FC } from "react"

import { StarIcon } from "../../atoms/icons/StarIcon"

export interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  /** What is starred, for the accessible label, e.g. a token symbol. */
  itemName: string
  id?: string
  className?: string
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  itemName,
  id,
  className,
}) => (
  <button
    id={id}
    type="button"
    aria-pressed={isFavorite}
    aria-label={
      isFavorite
        ? `Remove ${itemName} from favorites`
        : `Add ${itemName} to favorites`
    }
    onClick={(e) => {
      e.stopPropagation()
      onToggle()
    }}
    className={clsx(
      "inline-flex items-center justify-center shrink-0 w-3.5 h-3.5 rounded-md",
      "transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
      isFavorite
        ? "text-amber-400 hover:text-amber-500"
        : "text-gray-300 hover:text-gray-500 dark:text-zinc-500 dark:hover:text-zinc-300",
      isFavorite
        ? "opacity-100"
        : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
      className,
    )}
  >
    <StarIcon />
  </button>
)
