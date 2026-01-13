import Discord from "./assets/ds.svg"
import Github from "./assets/gh.svg"
import Twitter from "./assets/tw.svg"

import "./index.css"

export const SocialButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-5 sm:flex sm:justify-between sm:flex-wrap">
      <a
        className="transition-all social-button discord"
        href="https://discord.gg/a9BFNrYJ99"
        target="_blank"
        rel="noreferrer"
      >
        <div className="table social-button-wrapper">
          <div className="table-cell">
            <div className="table">
              <img src={Discord} alt="discord" className="table-cell" />
              <span className="table-cell">Discord</span>
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
        <div className="table social-button-wrapper">
          <div className="table-cell">
            <div className="table">
              <img src={Twitter} alt="twitter" className="table-cell" />
              <span className="table-cell">Twitter</span>
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
        <div className="table social-button-wrapper">
          <div className="table-cell">
            <div className="table">
              <img src={Github} alt="github" className="table-cell" />
              <span className="table-cell">Github</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}
