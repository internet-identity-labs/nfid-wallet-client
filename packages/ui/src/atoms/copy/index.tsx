import clsx from "clsx"
import React, { HTMLAttributes } from "react"
import ReactTooltip from "react-tooltip"

import { CopyIcon } from "../icons/copy"
import CopiedIcon from "./copied.svg"

export interface ICopy extends HTMLAttributes<HTMLDivElement> {
  value: string
  iconClassName?: string
  textClassName?: string
  copyTitle?: string
}

export const Copy: React.FC<ICopy> = ({
  value,
  className,
  iconClassName,
  textClassName,
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
        !copied && (className ?? "h-[100%] flex-1"),
        "flex items-center stroke-gray-400",
        className,
      )}
      onClick={copyToClipboard}
    >
      <div className={iconClassName ?? "w-5"}>
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
        <p
          className={clsx(
            "w-full",
            textClassName ?? "text-xs font-semibold text-secondary ml-2",
          )}
        >
          {copyTitle}
        </p>
      )}
      {!copied && <ReactTooltip delayShow={2000} />}
    </div>
  )
}
