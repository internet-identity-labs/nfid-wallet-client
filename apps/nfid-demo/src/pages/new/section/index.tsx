import React, { useState, useCallback } from "react"
import { FaCode, FaChrome } from "react-icons/fa"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import { IconCmpCopy, ToggleButton } from "@nfid-frontend/ui"

type SectionTemplateProps = {
  title: string
  subtitle: string
  example: JSX.Element
  codeSnippet: string
  jsonResponse: string
}

export const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  subtitle,
  example,
  codeSnippet,
  jsonResponse,
}) => {
  const [isLiveExample, setIsLiveExample] = useState(true)

  const handleToggleChange = useCallback((value: boolean) => {
    setIsLiveExample(!value)
  }, [])

  return (
    <div className="grid grid-cols-[3fr,2fr] w-full space-x-6">
      {/* Left Side */}
      <div className="flex-1">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="w-20">
            <ToggleButton
              firstValue={<FaChrome className="w-5" />}
              secondValue={<FaCode className="w-5" />}
              defaultValue={!isLiveExample}
              onChange={handleToggleChange}
            />
          </div>
        </div>
        <h3 className="mt-3 text-sm text-gray-600">{subtitle}</h3>

        {isLiveExample ? (
          <div className="mt-5">{example}</div>
        ) : (
          <div className="relative mt-4">
            <SyntaxHighlighter
              language="javascript"
              style={oneDark}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                padding: "20px",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            >
              {codeSnippet}
            </SyntaxHighlighter>
            <IconCmpCopy className="absolute text-gray-400 top-4 right-4" />
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="relative flex flex-col flex-1 p-4 bg-[rgb(40,44,52)]">
        <h4 className="text-lg text-white">Response</h4>
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            height: "100%", // Added this line
            padding: "20px",
            fontSize: "14px",
            overflow: "auto",
          }}
        >
          {jsonResponse}
        </SyntaxHighlighter>
        <IconCmpCopy className="absolute text-gray-400 top-4 right-4" />
      </div>
    </div>
  )
}
