import { useAuthenticationContext } from "apps/nfid-demo/src/context/authentication"
import { useAuthentication } from "apps/nfid-demo/src/hooks/useAuthentication"
import clsx from "clsx"
import React, { useState, useCallback } from "react"
import { FaCode, FaChrome } from "react-icons/fa"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import { Copy, ToggleButton } from "@nfid-frontend/ui"

type SectionTemplateProps = {
  title: string
  subtitle: string
  example: JSX.Element
  method?: string
  codeSnippet: string
  jsonResponse: string
}

export const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  subtitle,
  example,
  method,
  codeSnippet,
  jsonResponse,
}) => {
  const [isLiveExample, setIsLiveExample] = useState(true)

  const handleToggleChange = useCallback((value: boolean) => {
    setIsLiveExample(!value)
  }, [])

  return (
    <div
      className={clsx(
        "grid grid-cols-[3fr,2fr] w-full space-x-6 group min-h-[400px]",
      )}
    >
      {/* Left Side */}
      <div className="">
        <div className="flex justify-between">
          <h2 className="flex items-center text-xl font-semibold">
            {title}{" "}
            {method ? (
              <span
                className={clsx(
                  "px-2 py-1 ml-1 font-mono text-xs text-white bg-gray-800 rounded-lg",
                  "opacity-50 group-hover:opacity-100 transition-opacity",
                )}
              >
                {method}
              </span>
            ) : (
              ""
            )}
          </h2>
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
          <div className="relative mt-4 w-[40vw]">
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
      <div className="relative flex flex-col p-4 bg-[rgb(40,44,52)] rounded-[10px] w-[30vw]">
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
