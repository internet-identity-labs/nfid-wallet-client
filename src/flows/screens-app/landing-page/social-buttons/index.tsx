import React from "react"

import Discord from "./ds.svg"
import Github from "./gh.svg"
import Twitter from "./tw.svg"

interface SocialButtonsProps {}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ children }) => {
  return (
    <div className="grid justify-between grid-cols-2 gap-5 md:flex">
      <a
        className="transition-all social-button discord"
        href="https://discord.gg/a9BFNrYJ99"
        target="_blank"
        rel="noreferrer"
      >
        <div className="display-table social-button-wrapper">
          <div className="display-table-cell">
            <div className="display-table">
              <img src={Discord} alt="discord" className="display-table-cell" />
              <span className="display-table-cell">Discord</span>
            </div>
          </div>
        </div>
      </a>
      <a
        className="transition-all social-button twitter"
        href="https://twitter.com/IdentityMaxis"
        target="_blank"
        rel="noreferrer"
      >
        <div className="display-table social-button-wrapper">
          <div className="display-table-cell">
            <div className="display-table">
              <img src={Twitter} alt="twitter" className="display-table-cell" />
              <span className="display-table-cell">Twitter</span>
            </div>
          </div>
        </div>
      </a>
      <a
        className="transition-all social-button github"
        href="https://github.com/internet-identity-labs"
        target="_blank"
        rel="noreferrer"
      >
        <div className="display-table social-button-wrapper">
          <div className="display-table-cell">
            <div className="display-table">
              <img src={Github} alt="github" className="display-table-cell" />
              <span className="display-table-cell">Github</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}
