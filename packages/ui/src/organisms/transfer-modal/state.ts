import { atom } from "jotai"

import { IWallet, modalTypes } from "@nfid-frontend/ui"

export interface ITransferModalAtom {
  isModalOpen: boolean
  selectedNFT: string[]
  selectedWallet: IWallet
  sendType: "nft" | "ft"
  selectedWallets: string[]
  modalType: modalTypes
}

export const transferModalAtom = atom<ITransferModalAtom>({
  isModalOpen: false,
  sendType: "ft",
  selectedNFT: [],
  selectedWallet: {
    accountId: "",
    domain: "",
    balance: {},
  },
  selectedWallets: [],
  modalType: "Send",
})
