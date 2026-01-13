import clsx from "clsx"

import { Copy, CenterEllipsis } from "@nfid/ui"

interface IVaultTransactionInfo {
  title?: string
  direction: "left" | "right"
  value: string
}

export const VaultTransactionInfo = ({
  title,
  value,
  direction = "right",
}: IVaultTransactionInfo) => {
  return (
    <div className={clsx("flex", direction === "left" && "flex-row-reverse")}>
      <div className="w-full px-8 py-5 text-gray-600 rounded-l-lg bg-gray-50">
        <p className="font-bold tracking-[0.01em] mb-3">{title}</p>
        <div className="flex items-center">
          <CenterEllipsis value={value} leadingChars={20} trailingChars={10} />
          <Copy className="ml-3 text-secondary" value={value} />
        </div>
      </div>
      <div
        className={clsx(
          "hidden md:block border-l-[56px] border-t-[40px] border-b-[40px]",
          "border-l-gray-50 border-t-transparent border-b-transparent",
          direction === "left" && "rotate-180",
        )}
      />
    </div>
  )
}
