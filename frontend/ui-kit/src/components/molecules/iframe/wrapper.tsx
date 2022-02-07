import clsx from "clsx"
import React from "react"
import { Card } from "../card"

interface IFrameWrapperProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameWrapper: React.FC<IFrameWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <Card
      id="iframe-wrapper-card"
      className={clsx(
        "bg-white shadow-xl max-w-screen rounded-t-xl md:rounded-xl w-full md:w-[390px] duration-200 ease-in-out",
        "flex flex-col",
        "fixed bottom-0 right-0 md:top-[18px] md:right-7 md:overflow-hidden",
        className,
      )}
      style={{ height: 190 }}
    >
      {children}
    </Card>
  )
}
