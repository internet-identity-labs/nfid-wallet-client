import clsx from "clsx"
import React from "react"

export const Screen: React.FC = ({ children }) => (
  <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>{children}</div>
)
