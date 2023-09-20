import clsx from "clsx"
import React, { HTMLAttributes } from "react"
import ReactTooltip from "react-tooltip"

import { CopyIcon } from "../icons/copy"
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
        <img
          className={clsx(copied ? "inline-block" : "hidden")}
          src={CopiedIcon}
          alt="copy"
          data-tip="Copy"
        />

        <CopyIcon
          className={clsx(
            "w-full",
            copied ? "hidden" : "inline-block",
            iconClassName,
          )}
        />
      </div>

      {copyTitle && (
        <p className="w-full ml-2 text-xs font-semibold text-secondary">
          {copyTitle}
        </p>
      )}
      {!copied && <ReactTooltip delayShow={2000} />}
    </div>
  )
}
