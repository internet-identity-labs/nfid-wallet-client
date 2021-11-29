import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
    noGutters?: boolean
  }

export const Divider: React.FC<Props> = ({ className, noGutters = false }) => {
  return (
    <div aria-hidden="true" className={className}>
      <div className={noGutters ? 'py-0': 'py-5'}>
        <div className="border-t border-gray-200" />
      </div>
    </div>
  )
}
