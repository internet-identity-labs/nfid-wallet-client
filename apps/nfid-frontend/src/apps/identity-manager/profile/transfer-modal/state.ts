import { atom } from "jotai"

import { IWallet } from "frontend/ui/organisms/transfer-modal/types"

export interface ITransferModalAtom {
  isModalOpen: boolean
  selectedNFT: string[]
  selectedWallet: IWallet
  sendType: "nft" | "ft"
}

export const transferModalAtom = atom<ITransferModalAtom>({
  isModalOpen: false,
  sendType: "ft",
  selectedNFT: [],
  selectedWallet: {
    accountId: "",
    domain: "",
    balance: BigInt(0),
  },
})
