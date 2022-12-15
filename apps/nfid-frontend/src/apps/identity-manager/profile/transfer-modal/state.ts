import { atom } from "jotai"

import { IWallet } from "frontend/integration/wallet/hooks/types"

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
    balance: BigInt(0),
  },
})
