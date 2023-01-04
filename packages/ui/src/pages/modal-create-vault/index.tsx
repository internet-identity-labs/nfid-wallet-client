import React from "react"

import { Input, ModalAdvanced, TextArea } from "@nfid-frontend/ui"

export interface VaultModalCreateProps {
  onCreate: () => void
  onCancel: () => void
}

export const VaultModalCreate: React.FC<VaultModalCreateProps> = ({
  onCancel,
  onCreate,
}) => {
  return (
    <ModalAdvanced
      large
      title={"Add vault"}
      secondaryButton={{ type: "stroke", onClick: onCancel, text: "Cancel" }}
      primaryButton={{ type: "primary", onClick: onCreate, text: "Create" }}
    >
      <Input placeholder="Vault name" labelText="Enter vault name" />
      <TextArea
        className="mt-3"
        labelText="Description (optional)"
        placeholder="Short description. Create policies to secure DeFi transactions, including amount caps to limit your risk."
        rows={4}
      />
    </ModalAdvanced>
  )
}
