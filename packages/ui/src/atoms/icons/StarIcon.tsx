import { FC } from "react"

type StarIconProps = {
  filled?: boolean
  size?: number
  className?: string
}

/** Star outline, or a filled star. Colored with `currentColor`. */
export const StarIcon: FC<StarIconProps> = ({
  filled = false,
  size = 18,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5z" />
  </svg>
)
