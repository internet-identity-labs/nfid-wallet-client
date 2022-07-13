import clsx from "clsx"
import React from "react"

import { MapPinIcon } from "../icons/map-pin"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  small?: boolean
}

export const PoapLocation: React.FC<Props> = ({
  children,
  className,
  small = false,
}) => {
  return (
    <>
      <div className="flex mb-2">
        <MapPinIcon />
        <p
          style={{ display: "inline", paddingLeft: "10px", fontWeight: "700" }}
          className={clsx([
            "text-black leading-6 mb-3",
            small && "text-sm",
            className,
          ])}
        >
          {children}
        </p>
      </div>
    </>
  )
}
