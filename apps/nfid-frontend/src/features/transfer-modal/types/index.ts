import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { OCPQuote } from "frontend/integration/opencryptopay"

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
  CONVERT = "convert",
  STAKE = "stake",
  REDEEM = "redeem",
  BRIDGE = "bridge",
  EARN = "earn",
  WITHDRAW = "withdraw",
  PAY = "pay",
}

export interface SelectedToken {
  address: string
  chainId: ChainId
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
  blockIndex?: bigint
}

export type TransferMachineContext = {
  direction: ModalType | null
  tokenType: TokenType
  sourceWalletAddress: string
  sourceAccount?: Wallet
  selectedFT?: SelectedToken
  selectedTargetFT?: string
  selectedNFTId?: string
  receiverWallet: string
  amount: string
  transferObject?: ITransferSuccess
  error?: Error
  tokenStandard: string
  isEarnUpdate: boolean
  withdrawBalance: bigint
  openCryptoPayParams: string
  openCryptoPayPreselect?: { method: string; asset: string }
  isOpenedFromVaults: boolean
  stakeId?: string
}

export type Events =
  | { type: "SHOW" }
  | { type: "HIDE" }
  | { type: "CHANGE_TOKEN_TYPE"; data: TokenType }
  | { type: "CHANGE_DIRECTION"; data: ModalType | null }
  | { type: "ASSIGN_IS_EARN_UPDATE"; data: boolean | null }
  | { type: "ASSIGN_WITHDRAW_BALANCE"; data: bigint }
  | {
      type: "ASSIGN_OPEN_CRYPTOPAY_PARAMS"
      data: string
      preselect?: { method: string; asset: string }
    }
  | { type: "ASSIGN_SOURCE_ACCOUNT"; data: Wallet }
  | { type: "ASSIGN_SOURCE_WALLET"; data: string }
  | { type: "ASSIGN_STAKE_ID"; data: string }
  | { type: "ASSIGN_AMOUNT"; data: string }
  | { type: "ASSIGN_RECEIVER_WALLET"; data: string }
  | { type: "ASSIGN_SELECTED_FT"; data?: SelectedToken }
  | { type: "ASSIGN_SELECTED_TARGET_FT"; data: string }
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
  userNeuron: string
  note: string
}

export interface NeuronFormValues {
  userNeuron: string
}

export interface PayData {
  feeFormatted: string
  feeUsdFormatted: string
  amount: string
  amountFormatted: string
  amountUsdFormatted: string
  targetAddress: string
  quote: OCPQuote
}
