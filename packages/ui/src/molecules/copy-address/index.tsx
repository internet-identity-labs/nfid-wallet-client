import clsx from "clsx"
import CopiedIcon from "packages/ui/src/atoms/icons/copied-icon.svg"
import CopyIcon from "packages/ui/src/atoms/icons/copy-icon.svg"
import { FC, useCallback, useEffect, useState } from "react"

import { CenterEllipsis } from "@nfid-frontend/ui"

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
      className="flex gap-[10px] items-center cursor-pointer text-black"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={copyToClipboard}
    >
      <CenterEllipsis
        value={address}
        leadingChars={leadingChars}
        trailingChars={trailingChars}
        id={"principal"}
      />
      <img
        src={copied ? CopiedIcon : CopyIcon}
        alt="NFID icon"
        className={clsx(hovered || copied ? "" : "hidden", "w-[18px] h-[18px]")}
      />
    </div>
  )
}

export default CopyAddress
