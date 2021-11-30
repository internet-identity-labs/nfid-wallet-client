import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"

interface IFrameOverviewScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameOverviewScreen: React.FC<IFrameOverviewScreenProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen className={clsx("", className)}>
      {/* TODO: implement /authenticate + /login-unknown-device */}
    </AppScreen>
  )
}
