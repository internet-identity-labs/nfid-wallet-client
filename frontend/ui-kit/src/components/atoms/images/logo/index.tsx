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
  return (
    <a
      href={nav ? "/" : "#"}
      className={clsx(
        "group inline-flex items-center space-x-2 font-black tracking-wide text-black select-none",
        nav
          ? "hover:scale-110 transition-all duration-300 text-2xl"
          : "pointer-events-none text-3xl scale-110",
        className,
      )}
    >
      <span>NF</span>
      <img
        className={clsx(
          "inline-block object-contain",
          nav ? "w-[40px] h-[40px]" : "w-[50px] h-[50px]",
        )}
        src={Image}
      />
    </a>
  )
}
