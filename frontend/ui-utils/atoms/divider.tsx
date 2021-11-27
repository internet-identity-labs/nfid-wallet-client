import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Divider: React.FC<Props> = ({ className }) => {
  return (
    <div aria-hidden="true" className={className}>
      <div className="py-5">
        <div className="border-t border-gray-200" />
      </div>
    </div>
  )
}
