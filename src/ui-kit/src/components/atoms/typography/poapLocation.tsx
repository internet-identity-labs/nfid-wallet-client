import clsx from "clsx"
import React from "react"

import map_pin from "./map_pin.png"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  small?: boolean
}

export const PoapLocation: React.FC<Props> = ({ children, className, small = false }) => {
  return (
    <>
    <div style={{marginBottom:'1rem'}}>
      <img src={map_pin} style={{width:'24px', display:'inline'}}></img>
      <p
        style={{display:'inline', paddingLeft:'10px', fontWeight:'700'}}
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
