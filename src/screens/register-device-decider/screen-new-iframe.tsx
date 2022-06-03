import clsx from "clsx"
import React from "react"

import { ElementProps } from "frontend/types/react"

interface AuthorizeRegisterDeciderProps extends ElementProps<HTMLDivElement> {}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ children, className }) => {
  return <IFrameTemplate></IFrameTemplate>
}
