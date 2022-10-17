import { atom } from "jotai"

export interface ITransferModalAtom {
  isModalOpen: boolean
  selectedNFT: string[]
  sendType?: "nft" | "token"
}

export const transferModalAtom = atom<ITransferModalAtom>({
  isModalOpen: false,
  sendType: "token",
  selectedNFT: [],
})
