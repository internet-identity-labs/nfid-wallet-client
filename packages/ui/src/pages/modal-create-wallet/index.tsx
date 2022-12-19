import React from "react"

import { Input, ModalAdvanced } from "@nfid-frontend/ui"

export interface VaultModalCreateWalletProps {
  onCreate: () => void
  onCancel: () => void
}

export const VaultModalCreateWallet: React.FC<VaultModalCreateWalletProps> = ({
  onCancel,
  onCreate,
}) => {
  return (
    <ModalAdvanced
      large
      title="Add wallet"
      secondaryButton={{ type: "stroke", onClick: onCancel, text: "Cancel" }}
      primaryButton={{ type: "primary", onClick: onCreate, text: "Create" }}
    >
      <Input placeholder="Wallet name" labelText="Enter wallet name" />
    </ModalAdvanced>
  )
}
