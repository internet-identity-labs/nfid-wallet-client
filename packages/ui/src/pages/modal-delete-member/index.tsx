import clsx from "clsx"
import React from "react"

import { IconCmpArchive, ModalAdvanced } from "@nfid-frontend/ui"

export interface VaultModalDeleteMemberProps {
  onCancel: () => void
  onDelete: () => void
  userName: string
}

export const VaultModalDeleteMember: React.FC<VaultModalDeleteMemberProps> = ({
  onCancel,
  onDelete,
  userName,
}) => {
  return (
    <ModalAdvanced
      large
      title="Archive member"
      secondaryButton={{ type: "stroke", onClick: onCancel, text: "Cancel" }}
      primaryButton={{ type: "red", onClick: onDelete, text: "Archive" }}
    >
      <div className="flex items-start gap-5">
        <div
          className={clsx(
            "w-16 h-16 flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-red-50 to-white rounded-3xl",
          )}
        >
          <IconCmpArchive className="text-red-500 w-7" />
        </div>
        <p className="text-sm">
          This member will be excluded from this vault, and any pending
          transactions requiring their approval will need to be resubmitted.
          <br />
          <br />
          Archive <strong>{userName}</strong>?
        </p>
      </div>
    </ModalAdvanced>
  )
}
