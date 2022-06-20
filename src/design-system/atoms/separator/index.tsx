import React from "react"

interface SeparatorProps {}

export const Separator: React.FC<SeparatorProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-between w-full text-sm text-gray-200 h-9">
      <div className="flex w-full h-[1px] bg-gray-200" />
      <div className="px-2">or</div>
      <div className="flex w-full h-[1px] bg-gray-200" />
    </div>
  )
}
