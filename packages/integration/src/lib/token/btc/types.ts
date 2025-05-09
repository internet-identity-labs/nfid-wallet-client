export interface BTCAddress {
  address: string;
  derivationPath: string;
  createdAt: Date;
}

export interface BTCDeposit {
  address: string;
  amount: bigint;
  status: 'pending' | 'confirmed' | 'failed';
  txId: string;
  createdAt: Date;
  confirmedAt?: Date;
  confirmations: number;
}

export interface BTCRequest {
  address: string;
  derivationPath: string;
  createdAt: bigint;
} 