import clsx from "clsx"
import { useState } from "react"

import { CopiedIcon } from "../../ui/copied-icon"
import { Copy } from "../../ui/copy"
import { CopyIcon } from "../../ui/copy-icon"

export function InfoCopy({
  className,
  text,
  value,
  withBorder,
}: {
  className?: string
  text: string
  value: string
  withBorder?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <Copy
      value={value}
      onCopied={() => setCopied(true)}
      onCopiedTimeout={() => setCopied(false)}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "transition-all duration-200 flex px-0 lg:px-[20px] py-[20px] rounded-[12px] hover:bg-teal-500 hover:bg-opacity-10 cursor-pointer",
          className,
        )}
      >
        <div className="flex flex-col lg:flex-row max-w-[70%] md:max-w-full">
          <p className="text-white text-sm lg-text-[18px] w-[300px]">{text}</p>
          <p className="text-teal-500 text-sm lg-text-[18px] truncate">
            {value}
          </p>
        </div>
        <div
          className={clsx("ml-auto flex lg:hidden items-end lg:items-center", {
            "!flex": hovered,
          })}
        >
          {copied ? <CopiedIcon /> : <CopyIcon />}
        </div>
      </div>
      {withBorder && (
        <div className="mx-auto w-[95%] h-[1px] bg-teal-500 bg-opacity-10" />
      )}
    </Copy>
  )
}
