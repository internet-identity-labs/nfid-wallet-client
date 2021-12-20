import clsx from "clsx"
import React from "react"
import { Card } from "../card"

interface IFrameWrapperProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  inline?: boolean
}

export const IFrameWrapper: React.FC<IFrameWrapperProps> = ({
  children,
  className,
  inline,
}) => {
  return (
    <Card
      id="iframe-wrapper-card"
      className={clsx(
        "bg-white shadow-xl max-w-screen rounded-xl w-full md:w-[390px] transition-all duration-500",
        "flex flex-col",
        className,
        !inline && "fixed bottom-0 right-0  md:top-[18px] md:right-7",
      )}
      style={{ height: 190 }}
    >
      {children}
    </Card>
  )
}
