import clsx from "clsx"
import React, { useState, useCallback } from "react"
import { FaCode, FaChrome } from "react-icons/fa"
import { PrismAsync } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const SyntaxHighlighter = PrismAsync as React.ComponentType<any>

import { Copy, ToggleButton } from "@nfid-frontend/ui"

type SectionTemplateProps = {
  title: string
  subtitle: string | JSX.Element
  example: JSX.Element
  method?: string
  codeSnippet: string
  jsonResponse: string
  id: string
}

export const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  subtitle,
  example,
  method: _method,
  codeSnippet,
  jsonResponse,
  id,
}) => {
  const [isLiveExample, setIsLiveExample] = useState(true)

  const handleToggleChange = useCallback((value: boolean) => {
    setIsLiveExample(!value)
  }, [])

  return (
    <div
      className={clsx(
        "grid grid-cols-1 md:grid-cols-[3fr,2fr] w-full group min-h-[400px]",
        "gap-6",
      )}
      id={id}
    >
      {/* Left Side */}
      <div className="">
        <div className="flex justify-between">
          <h2 className="flex items-center text-xl font-semibold">{title}</h2>
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
          <div className="relative flex-1 mt-4">
            <SyntaxHighlighter
              language="javascript"
              style={oneDark}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                padding: "20px",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            >
              {codeSnippet}
            </SyntaxHighlighter>
            <Copy
              className="absolute text-gray-400 top-4 right-4"
              value={codeSnippet}
            />
          </div>
        )}
      </div>

      {/* Right Side */}
      <div
        id="responseID"
        className="relative flex flex-col p-4 bg-[rgb(40,44,52)] rounded-[10px] flex-1 md:w-[30vw]"
      >
        <h4 className="text-lg text-white">Response</h4>
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          showLineNumbers={true}
          wrapLines={true}
          //   wrapLongLines={true}
          customStyle={{
            maxHeight: "50vh",
            padding: "20px",
            fontSize: "13px",
            overflow: "auto",
          }}
        >
          {jsonResponse}
        </SyntaxHighlighter>
        <Copy
          className="absolute text-gray-400 top-4 right-4"
          value={jsonResponse}
        />
      </div>
    </div>
  )
}
