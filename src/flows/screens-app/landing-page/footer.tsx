import React from "react"

import PoweredBy from "./assets/poweredBy.svg"

interface FooterProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <footer className="flex flex-col items-center justify-between mt-[100px] md:flex-row">
      <small>© 2022 Internet Identity Labs, Inc</small>
      <div>
        <a href="https://smartcontracts.org" target="_blank" rel="noreferrer"><img src={PoweredBy} alt="PoweredBy" /></a>
      </div>
    </footer>
  )
}
