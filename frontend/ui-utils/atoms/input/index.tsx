import React from "react"

interface Props {
  prependedText?: string
  placeholder?: string,
  type?: string,
}

export const Input: React.FC<Props> = ({ prependedText, placeholder, type = "text" }) => {
  return (
    <div>
      <div className="mt-1 flex rounded-md shadow-sm">
        {prependedText && (
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {prependedText}
          </span>
        )}
        <input
          type={type}
          className={`${
            prependedText ? "rounded-r-md" : "rounded-md"
          } focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full sm:text-sm border-gray-300`}
          placeholder={placeholder ?? ""}
        />
      </div>
    </div>
  )
}
