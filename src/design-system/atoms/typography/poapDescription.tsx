import clsx from "clsx"
import React from "react"

import info from "./info.png"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  small?: boolean
}

export const PoapDescription: React.FC<Props> = ({ children, className, small = false }) => {
  return (
    <>
    <div>
      <img src={info} style={{width:'24px', display:'inline'}}></img>
      <p
        style={{display:'inline', paddingLeft:'10px'}}
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
