import clsx from "clsx"
import { useCallback, useState } from "react"

import { ReactComponent as IconCmpCopied } from "./assets/copied.svg"
import { ReactComponent as IconCmpCopy } from "./assets/copy.svg"

export interface AddressProps {
  className?: string
  address: string
  isAbsolute?: boolean
  id?: string
  disableTruncate?: boolean
}

export const truncateString = (
  str: string,
  leadingChars: number,
  trailingChars?: number,
): string => {
  if (str.length < leadingChars) return str
  if (trailingChars) {
    const splitAt = str.length - trailingChars
    return `${str.slice(0, leadingChars)}...${str.slice(splitAt)}`
  }

  return `${str.slice(0, leadingChars)}...`
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
        "active:text-gray-400",
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
