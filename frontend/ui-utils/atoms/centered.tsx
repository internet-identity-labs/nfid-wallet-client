import React from "react"

export const Centered: React.FC = ({ children }) => (
  <div className="flex flex-col h-full w-full justify-center items-center">
    <div>{children}</div>
  </div>
)
