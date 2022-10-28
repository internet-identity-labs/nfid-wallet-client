import React from "react"
import { Link, useRoute } from "wouter"

interface NavItem {
  route: string
  children?: JSX.Element | JSX.Element[]
}

export const NavLink: React.FC<NavItem> = ({ route, children }) => {
  const [isActive] = useRoute(route)

  return (
    <Link key={route} href={route}>
      <a href={route}>
        {React.cloneElement(children as JSX.Element, { isActive })}
      </a>
    </Link>
  )
}
