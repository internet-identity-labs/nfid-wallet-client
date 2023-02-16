export interface BasicSignatureEvent {
  application: string
  eventType: SignatureEvent
  chain: string
}

export interface TransferSignatureEvent extends BasicSignatureEvent {
  from: string
  to: string
  value: number
  token: string
}

export interface TransferNftSignatureEvent extends BasicSignatureEvent {
  from: string
  to: string
  token: string
}

export interface MessageSignatureEvent extends BasicSignatureEvent {
  message: string
  blockchainAddress: string
}

export enum SignatureEvent {
  TRANSFER = "transfer",
  TRANSFER_NFT = "transfer_nft",
  MESSAGE = "message",
}
