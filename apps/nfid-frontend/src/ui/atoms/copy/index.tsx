import clsx from "clsx"
import React from "react"

import { Tooltip } from "@nfid-frontend/ui"

import { ElementProps } from "frontend/types/react"

import CopiedIcon from "./copied.svg"
import CopyIcon from "./copy.svg"

interface ICopy extends ElementProps<HTMLDivElement> {
  value: string
}

export const Copy: React.FC<ICopy> = ({ value, className }) => {
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
        className,
      )}
    >
      <Tooltip tip="Copy">
        <img
          className="w-full"
          onClick={copyToClipboard}
          src={copied ? CopiedIcon : CopyIcon}
          alt="copy"
        />
      </Tooltip>
    </div>
  )
}
