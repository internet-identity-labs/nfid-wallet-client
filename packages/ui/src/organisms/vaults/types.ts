import { StoredVault, VaultCreationPrice } from "@nfid/integration"

export interface VaultsProps {
  vaults: StoredVault[] | undefined
  isLoading: boolean
  createVault: (name: string) => Promise<void>
  getPrice: () => Promise<VaultCreationPrice | undefined>
  links: {
    vaults: string
  }
}

export type CreateVaultModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  price: VaultCreationPriceFormatted | undefined
  priceLoading: boolean
}

export type VaultCreationPriceFormatted = {
  icpPrice: string
  cyclePrice: string
}

export type CreateVaultFormValues = {
  vaultName: string
}

export enum CreateVaultStep {
  PREPARE = "PREPARE",
  PAY = "PAY",
}
