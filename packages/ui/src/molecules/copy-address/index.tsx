import clsx from "clsx"
import { FC, useCallback, useState } from "react"

import { CenterEllipsis } from "@nfid/ui"

import { CopiedAddressIcon } from "@nfid/ui/atoms/icons/CopiedAddressIcon"
import { CopyAddressIcon } from "@nfid/ui/atoms/icons/CopyAddressIcon"

export interface CopyAddressProps {
  address: string
  leadingChars?: number
  trailingChars?: number
  alwaysShowIcon?: boolean
  className?: string
  iconClassName?: string
}

export const CopyAddress: FC<CopyAddressProps> = ({
  address,
  leadingChars,
  trailingChars,
  alwaysShowIcon,
  className,
  iconClassName,
}) => {
  const [hovered, setHovered] = useState(false)
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
      className={clsx(
        "inline-flex gap-[10px] items-center cursor-pointer relative",
        "text-black active:text-gray-400 hover:text-zinc-500 transition-colors",
        copied && "!text-black dark:!text-white",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={copyToClipboard}
    >
      {!leadingChars || !trailingChars ? (
        address
      ) : (
        <CenterEllipsis
          value={address}
          leadingChars={leadingChars}
          trailingChars={trailingChars}
          id={"principal"}
          className="transition-opacity duration-300"
        />
      )}

      {copied ? (
        <CopiedAddressIcon
          className={clsx(
            "w-[18px] h-[18px] transition-opacity duration-300",
            hovered || copied ? "" : "opacity-0",
            iconClassName,
          )}
        />
      ) : (
        <CopyAddressIcon
          className={clsx(
            "w-[18px] h-[18px] transition-opacity duration-300", // Ensure transition for both icons
            hovered || copied || alwaysShowIcon ? "" : "opacity-0",
            iconClassName,
          )}
        />
      )}
    </div>
  )
}

export default CopyAddress
