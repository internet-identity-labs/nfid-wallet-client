import { Icrc1BlockIndex } from "@dfinity/ledger-icp"

import { Wallet } from "frontend/integration/wallet/hooks/use-all-wallets"

import { ITransferSuccess } from "../components/send-success"
import { ISwapSuccess } from "../components/swap-success"

export type ModalType = "send" | "receive" | "swap"
export type TokenType = "ft" | "nft"

export type SuccessState = "pending" | "success" | "error"

export interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
  hash?: string
  blockIndex?: Icrc1BlockIndex
}

export interface ISwapResponse {
  swapProgress: any
}

export type TransferMachineContext = {
  direction: ModalType
  tokenType: TokenType
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: string
  selectedNFTId?: string
  receiverWallet: string
  amount: string
  transferObject?: ITransferSuccess
  swapObject?: ISwapSuccess
  error?: Error
  tokenStandard: string
  isOpenedFromVaults: boolean
}

export type Events =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "CHANGE_TOKEN_TYPE"; data: TokenType }
  | { type: "CHANGE_DIRECTION"; data: ModalType }
  | { type: "ASSIGN_SOURCE_ACCOUNT"; data: Wallet }
  | { type: "ASSIGN_SOURCE_WALLET"; data: string }
  | { type: "ASSIGN_AMOUNT"; data: string }
  | { type: "ASSIGN_RECEIVER_WALLET"; data: string }
  | { type: "ASSIGN_SELECTED_FT"; data: string }
  | { type: "ASSIGN_SELECTED_NFT"; data: string }
  | { type: "ASSIGN_ERROR"; data: string }
  | { type: "ASSIGN_TOKEN_STANDARD"; data: string }
  | { type: "ON_TRANSFER"; data: ITransferSuccess }
  | { type: "ON_SWAP"; data: ISwapSuccess }
  | { type: "ASSIGN_VAULTS"; data: boolean }

export type Services = {
  transferFT: {
    data: any
  }
  transferNFT: {
    data: any
  }
}
