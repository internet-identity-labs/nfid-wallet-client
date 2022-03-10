import React from "react"
import clsx from "clsx"
import Avatar from "./avatar.png"

interface PlaceholderImageProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  children,
  className,
}) => {
  return (
    <img
      alt="placeholder"
      className={clsx("rounded-full w-20 h-20", className)}
      src={Avatar}
    />
  )
}
