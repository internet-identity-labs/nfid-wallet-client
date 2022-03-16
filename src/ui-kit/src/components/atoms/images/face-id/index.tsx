import clsx from "clsx"
import React from "react"

import Logo from "./logo.png"

interface FaceIdProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const FaceId: React.FC<FaceIdProps> = ({ children, className }) => {
  return (
    <img alt="faceid-icon" src={Logo} className={clsx(className ?? "w-20")} />
  )
}
