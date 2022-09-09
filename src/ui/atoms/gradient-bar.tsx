import clsx from "clsx"
import React from "react"

interface NFIDGradientBarProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean
}

export const NFIDGradientBar: React.FC<NFIDGradientBarProps> = ({
  rounded = true,
  className,
}) => {
  const nfidGradientBar = {
    background: `linear-gradient(
      90deg,
      #3dedd7 0%,
      #02cdfe 25%,
      #3781f4 50.52%,
      #7063ff 76.04%,
      #cc5cdc 100%
    )`,
  }

  return (
    <div
      className={clsx(
        "absolute top-0 h-[4px] w-full inset-0 mx-auto",
        rounded && "rounded-b",
        className,
      )}
      style={nfidGradientBar}
    />
  )
}
