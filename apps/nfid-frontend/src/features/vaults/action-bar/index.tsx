import clsx from "clsx"
import React, { ChangeEvent, KeyboardEvent } from "react"

import { IconCmpSearch, Input } from "@nfid/ui"

export interface VaultActionBarProps {
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onInputType?: (event: KeyboardEvent<HTMLInputElement>) => void
}

export const VaultActionBar: React.FC<VaultActionBarProps> = ({
  onInputChange,
  onInputType,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between",
        "bg-gray-50 p-5 rounded-t-xl sm:rounded-b-md",
      )}
    >
      <Input
        placeholder="Search"
        icon={<IconCmpSearch className="w-4" />}
        onChange={onInputChange}
        onKeyDown={onInputType}
        className="sm:w-[350px]"
      />
    </div>
  )
}
