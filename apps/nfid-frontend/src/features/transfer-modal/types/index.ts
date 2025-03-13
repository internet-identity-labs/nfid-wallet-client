import { Icrc1BlockIndex } from "@dfinity/ledger-icp"

import { Wallet } from "frontend/integration/wallet/hooks/use-all-wallets"

export interface ITransferSuccess {
  onClose?: () => void
  initialPromise: Promise<ITransferResponse>
  callback?: (res?: ITransferResponse) => void
  errorCallback?: (res?: ITransferResponse) => void
  title: string
  subTitle: string
  assetImg: string
  isAssetPadding?: boolean
  duration?: string
  withToasts?: boolean
}

export enum ModalType {
  SEND = "send",
  RECEIVE = "receive",
  SWAP = "swap",
  STAKE = "stake",
}

export enum SendStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type TokenType = "ft" | "nft"

export interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
  hash?: string
  blockIndex?: Icrc1BlockIndex
}

export type TransferMachineContext = {
  direction: ModalType | null
  tokenType: TokenType
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: string
  selectedNFTId?: string
  receiverWallet: string
  amount: string
  transferObject?: ITransferSuccess
  error?: Error
  tokenStandard: string
  isOpenedFromVaults: boolean
}

export type Events =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "CHANGE_TOKEN_TYPE"; data: TokenType }
  | { type: "CHANGE_DIRECTION"; data: ModalType | null }
  | { type: "ASSIGN_SOURCE_ACCOUNT"; data: Wallet }
  | { type: "ASSIGN_SOURCE_WALLET"; data: string }
  | { type: "ASSIGN_AMOUNT"; data: string }
  | { type: "ASSIGN_RECEIVER_WALLET"; data: string }
  | { type: "ASSIGN_SELECTED_FT"; data: string }
  | { type: "ASSIGN_SELECTED_NFT"; data: string }
  | { type: "ASSIGN_ERROR"; data: string }
  | { type: "ASSIGN_TOKEN_STANDARD"; data: string }
  | { type: "ON_TRANSFER"; data: ITransferSuccess }
  | { type: "ASSIGN_VAULTS"; data: boolean }

export type Services = {
  transferFT: {
    data: any
  }
  transferNFT: {
    data: any
  }
}

export interface FormValues {
  amount: string
  to: string
  lockTime: string
}
