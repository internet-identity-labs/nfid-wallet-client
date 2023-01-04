import React from "react"

import { Input, ModalAdvanced, TextArea } from "@nfid-frontend/ui"

export interface VaultModalAddMemberProps {
  onCreate: () => void
  onCancel: () => void
}

export const VaultModalAddMember: React.FC<VaultModalAddMemberProps> = ({
  onCancel,
  onCreate,
}) => {
  return (
    <ModalAdvanced
      large
      title={"Add member"}
      secondaryButton={{ type: "stroke", onClick: onCancel, text: "Cancel" }}
      primaryButton={{ type: "primary", onClick: onCreate, text: "Create" }}
    >
      <div className="space-y-4">
        <Input placeholder="First name" labelText="First name" />
        <Input placeholder="Last name" labelText="Last name" />
        <Input
          placeholder="asdewf-32525f-124124-fwefwe-23235f"
          labelText="NFID address"
        />
      </div>
    </ModalAdvanced>
  )
}
