import clsx from "clsx"
import React from "react"
import Image from "./NFID.png"

interface LogoProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  nav?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  children,
  className,
  nav = false,
}) => {
  return nav ? (
    <a
      href="/"
      className="group inline-flex items-center space-x-2 font-bold text-lg tracking-wide text-gray-700 hover:scale-110 transition-all duration-300 active:text-gray-700"
    >
      <span>NF</span>
      <img className="inline-block w-6 h-6 object-contain" src={Image} />
    </a>
  ) : (
    <img className={clsx("object-contain", className)} src={Image} />
  )
}
