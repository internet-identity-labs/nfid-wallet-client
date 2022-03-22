import clsx from "clsx"
import React from "react"
import { FaGithub, FaTwitter } from "react-icons/fa"

interface FooterProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Footer: React.FC<FooterProps> = ({ children, className }) => {
  const classes = {
    socialIcon: "w-5 h-5 hover:scale-110 transition duration-200",
  }

  return (
    <footer className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <span className="mr-2 font-medium text-sm">Connect us on</span>
        <div className="flex items-center space-x-2">
          <a
            href="https://twitter.com/IdentityMaxis"
            target={"_blank"}
            rel="noopener noreferrer"
          >
            <FaTwitter className={clsx("text-blue-500", classes.socialIcon)} />
          </a>
          <a
            href="https://github.com/InternetIdentityLabs"
            target={"_blank"}
            rel="noopener noreferrer"
          >
            <FaGithub className={clsx(classes.socialIcon)} />
          </a>
        </div>
      </div>
      <small>© 2022 Internet Identity Labs, Inc</small>
    </footer>
  )
}
