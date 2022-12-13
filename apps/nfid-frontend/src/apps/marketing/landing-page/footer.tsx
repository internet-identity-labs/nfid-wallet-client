import React from "react"

import PoweredBy from "./assets/poweredBy.svg"

interface FooterProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <footer className="flex flex-col items-center justify-between mt-[100px] md:flex-row pb-4 sm:pb-0">
      <div className="flex flex-wrap items-center justify-center mb-2 space-x-6 sm:mb-0">
        <a
          className="text-blue hover:underline"
          href="https://docs.nfid.one/privacy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy policy
        </a>
        <p className="text-base">© 2022 Internet Identity Labs, Inc</p>
      </div>
      <div>
        <a href="https://smartcontracts.org" target="_blank" rel="noreferrer">
          <img src={PoweredBy} alt="PoweredBy" />
        </a>
      </div>
    </footer>
  )
}
