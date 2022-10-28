import React from "react"
import { Link as WouterLink, useRoute } from "wouter"

export const Link: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => {
  return (
    <WouterLink href={to}>
      <a href={to}>{children}</a>
    </WouterLink>
  )
}

interface NavItem {
  route: string
  children?: JSX.Element | JSX.Element[]
}

export const NavLink: React.FC<NavItem> = ({ route, children }) => {
  const [isActive] = useRoute(route)

  return (
    <Link to={route}>
      {React.cloneElement(children as JSX.Element, { isActive })}
    </Link>
  )
}
