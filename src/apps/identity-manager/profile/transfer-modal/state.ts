import { atom } from "jotai"

import { IWallet } from "frontend/integration/identity-manager/wallet/types"

export interface ITransferModalAtom {
  isModalOpen: boolean
  selectedNFT: string[]
  selectedWallet: IWallet
  sendType?: "nft" | "token"
}

export const transferModalAtom = atom<ITransferModalAtom>({
  isModalOpen: false,
  sendType: "token",
  selectedNFT: [],
  selectedWallet: {
    accountId: "",
    domain: "",
  },
})
