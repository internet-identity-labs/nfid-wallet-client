import React from "react"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  rows?: number
  placeholder?: string
  defaultValue?: string
  infoMessage?: string
}

export const TextArea: React.FC<Props> = ({
  rows = 3,
  placeholder,
  infoMessage,
  defaultValue,
}) => {
  return (
    <div>
      <div className="mt-1">
        <textarea
          id="about"
          rows={rows}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      </div>
      {infoMessage && (
        <p className="mt-2 text-xs text-gray-500">{infoMessage}</p>
      )}
    </div>
  )
}
