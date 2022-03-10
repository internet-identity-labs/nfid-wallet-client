import React from "react"
import TouchIdIcon from "./logo.png"

export const TouchId: React.FC<React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>> = ({ className = "w-10" }) => (
  <img alt="touchid-icon" src={TouchIdIcon} className={className} />
)
