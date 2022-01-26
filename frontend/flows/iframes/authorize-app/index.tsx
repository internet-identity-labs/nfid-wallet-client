import React from "react"
import clsx from "clsx"
import { useAuthentication } from "../nfid-login/hooks"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({ className }) => {
  const { isAuthenticated } = useAuthentication()
  console.log(">> ", { isAuthenticated })

  return <div className={clsx("", className)}>AuthorizeApp</div>
}
