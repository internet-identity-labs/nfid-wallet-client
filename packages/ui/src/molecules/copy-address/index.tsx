import clsx from "clsx"
import { FC, useCallback, useState } from "react"

import { CenterEllipsis } from "@nfid-frontend/ui"

import { CopiedAddressIcon } from "../../atoms/icons/CopiedAddressIcon"
import { CopyAddressIcon } from "../../atoms/icons/CopyAddressIcon"

export interface CopyAddressProps {
  address: string
  leadingChars: number
  trailingChars: number
}

export const CopyAddress: FC<CopyAddressProps> = ({
  address,
  leadingChars,
  trailingChars,
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
        "inline-flex gap-[10px] items-center cursor-pointer",
        "text-black active:text-gray-400 hover:text-zinc-500 transition-colors",
        copied && "!text-black",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={copyToClipboard}
    >
      <CenterEllipsis
        value={address}
        leadingChars={leadingChars}
        trailingChars={trailingChars}
        id={"principal"}
        className="transition-opacity duration-300" // Ensure the text also has a smooth opacity transition
      />
      {copied ? (
        <CopiedAddressIcon
          className={clsx(
            "w-[18px] h-[18px] transition-opacity duration-300", // Ensure transition for both icons
            hovered || copied ? "" : "opacity-0",
          )}
        />
      ) : (
        <CopyAddressIcon
          className={clsx(
            "w-[18px] h-[18px] transition-opacity duration-300", // Ensure transition for both icons
            hovered || copied ? "" : "opacity-0",
          )}
        />
      )}
    </div>
  )
}

export default CopyAddress
