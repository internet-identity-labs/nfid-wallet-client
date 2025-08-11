import * as ReactTooltip from "@radix-ui/react-tooltip"
import clsx from "clsx"
import React, { HTMLAttributes } from "react"

import { CopyIcon } from "../icons/copy"
import CopiedIcon from "./copied.svg"

export interface ICopy extends HTMLAttributes<HTMLDivElement> {
  value: string
  iconClassName?: string
  copyTitle?: string
  iconSize?: string
  titleClassName?: string
}

export const Copy: React.FC<ICopy> = ({
  value,
  className,
  iconClassName,
  copyTitle,
  iconSize,
  titleClassName,
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
    <ReactTooltip.Provider>
      <ReactTooltip.Root delayDuration={2000}>
        <ReactTooltip.Trigger asChild>
          <div
            className={clsx(
              !copied && "hover:opacity-50 cursor-pointer transition-opacity",
              "flex items-center stroke-gray-400 dark:stroke-zinc-400 text-xs text-secondary dark:text-zinc-400 font-semibold",
              className,
            )}
            onClick={copyToClipboard}
          >
            <div className={clsx("w-5", iconSize)}>
              <img
                className={clsx(copied ? "inline-block" : "hidden")}
                src={CopiedIcon}
                alt="copy"
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
                  "w-full ml-2 text-xs font-semibold text-secondary",
                  titleClassName,
                )}
              >
                {copyTitle}
              </p>
            )}
          </div>
        </ReactTooltip.Trigger>
        {!copied && (
          <ReactTooltip.Content side="top" align="center">
            <ReactTooltip.Arrow className="text-gray-800 fill-current" />
            <div className="p-2 text-xs text-white bg-gray-800 rounded-md">
              Copy
            </div>
          </ReactTooltip.Content>
        )}
      </ReactTooltip.Root>
    </ReactTooltip.Provider>
  )
}
