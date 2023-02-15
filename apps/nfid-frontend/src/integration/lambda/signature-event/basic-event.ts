export interface BasicSignatureEvent {
  application: string;
  eventType: SignatureEvent;
  chain: string;
}

export interface TransferSignatureEvent  extends BasicSignatureEvent {
  from: string;
  to: string;
  value: number;
  token: string;
}

export enum SignatureEvent {
  TRANSFER = 'transfer',
}
