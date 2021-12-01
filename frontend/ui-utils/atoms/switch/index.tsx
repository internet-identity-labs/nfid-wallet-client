import React, { useImperativeHandle, useRef, useState } from "react"
import clsx from "clsx"

interface SwitchProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Switch: React.FC<SwitchProps> = ({ children, className }) => {
  const [toggle, setToggle] = useState(false)

  return (
    <div
      className={clsx(
        "w-14 h-7 flex items-center rounded-full p-1 cursor-pointer flex-shrink-0",
        className,
        toggle ? "bg-indigo-500" : "bg-gray-300",
      )}
      onClick={() => setToggle(!toggle)}
    >
      <div
        className={clsx(
          "bg-white h-[22px] w-[23px] rounded-full shadow-md transform duration-500 transition-all",
          toggle && "transform translate-x-[26px]",
        )}
      ></div>
    </div>
  )
}
