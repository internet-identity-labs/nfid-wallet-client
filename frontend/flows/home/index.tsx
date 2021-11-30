import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { H4 } from "frontend/ui-utils/atoms/typography"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  return (
    <>
      <AppScreen title="Home">
        <H4>Welcome 👋</H4>
      </AppScreen>
    </>
  )
}
