import React from "react"

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({ children }) => (
  <div className="py-4 mx-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 lg:mx-0">
    <div className="text-2xl font-medium">{children}</div>
  </div>
)
