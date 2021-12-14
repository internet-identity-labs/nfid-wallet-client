import React from "react"
import Logo from "./logo.png"
import clsx from "clsx"

interface FaceIdProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const FaceId: React.FC<FaceIdProps> = ({ children, className }) => {
  return <img src={Logo} className={clsx(className ?? "w-20")} />
}
