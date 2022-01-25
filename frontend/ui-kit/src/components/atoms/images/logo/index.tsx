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
      className="group inline-flex items-center space-x-2 font-black text-2xl tracking-wide text-black hover:scale-110 transition-all duration-300"
    >
      <span>NF</span>
      <img
        className="inline-block w-[40px] h-[40px] object-contain"
        src={Image}
      />
    </a>
  ) : (
    <img
      className={clsx("w-[40px] h-[40px] object-contain", className)}
      src={Image}
    />
  )
}
