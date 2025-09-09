import clsx from "clsx"
import { useCallback, useState } from "react"

import { truncateString } from "@nfid-frontend/utils"

import { ReactComponent as IconCmpCopied } from "./assets/copied.svg"
import { ReactComponent as IconCmpCopy } from "./assets/copy.svg"

export interface AddressProps {
  className?: string
  address: string
  isAbsolute?: boolean
  id?: string
  disableTruncate?: boolean
}

export const Address: React.FC<AddressProps> = ({
  className,
  address,
  isAbsolute = false,
  id,
  disableTruncate,
}) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    setCopied(true)
    navigator.clipboard.writeText(address)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }, [address])

  return (
    <div
      id={id}
      className={clsx(
        "flex items-center group/address cursor-pointer",
        "text-black relative hover:gap-2.5",
        "active:text-gray-400 dark:text-white dark:hover:text-white dark:active:text-zinc-400",
        copied && "gap-2.5",
        className,
      )}
      onClick={copyToClipboard}
    >
      <span className="text-sm lowercase">
        {disableTruncate
          ? address
          : truncateString(address.toLowerCase(), 6, 4)}
      </span>
      <div className={clsx(isAbsolute ? "absolute -right-6" : "relative")}>
        {copied ? (
          <IconCmpCopied />
        ) : (
          <IconCmpCopy className="hidden group-hover/address:block" />
        )}
      </div>
    </div>
  )
}
