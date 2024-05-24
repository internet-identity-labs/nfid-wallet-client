import clsx from "clsx"
import React, { HTMLAttributes } from "react"
import ReactTooltip from "react-tooltip"

import { CopyIcon } from "../icons/copy"
import CopiedIcon from "./copied.svg"

export interface ICopy extends HTMLAttributes<HTMLDivElement> {
  value: string
  iconClassName?: string
  copyTitle?: string
  iconSize?: string
  gap?: number
}

export const Copy: React.FC<ICopy> = ({
  value,
  className,
  iconClassName,
  copyTitle,
  iconSize,
  gap,
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
        "flex items-center stroke-gray-400 text-xs text-secondary font-semibold",
        className,
      )}
      onClick={copyToClipboard}
    >
      <div className={clsx("w-5", iconSize)}>
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
        <p className={`w-full ${gap ? "ml-[" + gap + "px]" : "ml-2"}`}>
          {copyTitle}
        </p>
      )}
      {!copied && <ReactTooltip delayShow={2000} />}
    </div>
  )
}
