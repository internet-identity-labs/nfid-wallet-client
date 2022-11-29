import clsx from "clsx"
import React, { HTMLAttributes } from "react"
import ReactTooltip from "react-tooltip"

import CopiedIcon from "./copied.svg"

export interface ICopy extends HTMLAttributes<HTMLDivElement> {
  value: string
  iconClassName?: string
  copyTitle?: string
}

export const Copy: React.FC<ICopy> = ({
  value,
  className,
  iconClassName,
  copyTitle,
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = React.useCallback(() => {
    setCopied(true)
    navigator.clipboard.writeText(value)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }, [value])

  return (
    <div
      className={clsx(
        !copied && "hover:opacity-50 cursor-pointer transition-opacity",
        "flex items-center stroke-gray-400",
        className,
      )}
      onClick={copyToClipboard}
    >
      <div className="w-5">
        {copied && (
          <img className="w-full" src={CopiedIcon} alt="copy" data-tip="Copy" />
        )}

        {!copied && (
          <svg
            className={clsx("w-full", iconClassName)}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_399_379)">
              <path
                d="M15.6296 7H8.36986C7.61331 7 7 7.62175 7 8.38871L7.00054 15.6113C7.00054 16.3783 7.61384 17 8.3704 17L15.6301 17C16.3867 17 17 16.3783 17 15.6113L16.9995 8.38871C16.9995 7.62175 16.3862 7 15.6296 7Z"
                stroke="inherit"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.5 11.4993H2.66667C2.22464 11.4993 1.80072 11.3238 1.48816 11.0112C1.17559 10.6986 1 10.2747 1 9.83268V2.66667C1 2.22464 1.17559 1.80072 1.48816 1.48816C1.80072 1.17559 2.22464 1 2.66667 1L9.83268 1C10.2747 1 10.6986 1.17559 11.0112 1.48816C11.3238 1.80072 11.4993 2.22464 11.4993 2.66667V3.5"
                stroke="inherit"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_399_379">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        )}
      </div>

      {copyTitle && (
        <p className="w-full ml-2 text-xs font-semibold text-gray-400">
          {copyTitle}
        </p>
      )}
      {!copied && <ReactTooltip delayShow={2000} />}
    </div>
  )
}
