export interface BlockCypherTx {
  tx: {
    block_height: number
    block_index: number
    hash: string
    addresses: string[]
    total: number
    fees: number
    size: number
    preference: string
    relayed_by: string
    received: string
    ver: number
    double_spend: boolean
    vin_sz: number
    vout_sz: number
    confirmations: number
    inputs: {
      prev_hash: string
      output_index: number
      script: string
      output_value: number
      sequence: number
      addresses: string[]
      script_type: string
      age: number
      value: number
      tx_index: number
    }[]
    outputs: {
      value: number
      script: string
      spent_by: string
      addresses: string[]
      script_type: string
      tx_index: number
    }[]
  }
  tosign: string[]
  signatures: string[]
}

export interface Fee {
  halfHourFee: number
  hourFee: number
  fastestFee: number
}

export interface BlockCypherAddressResponse {
  address: string
  total_received: number
  total_sent: number
  balance: number
  unconfirmed_balance: number
  final_balance: number
  n_tx: number
  unconfirmed_n_tx: number
  final_n_tx: number
  txrefs: BlockCypherTransaction[]
  unconfirmed_txrefs: BlockCypherTransaction[]
}

export interface BlockCypherAddressFullResponse {
  address: string
  total_received: number
  total_sent: number
  balance: number
  unconfirmed_balance: number
  final_balance: number
  n_tx: number
  unconfirmed_n_tx: number
  final_n_tx: number
  txs: BlockCypherTransaction[]
}

interface BlockCypherTransaction {
  block_height: number
  hash: string
  addresses: string[]
  total: number
  confirmed: number
  fees: number
  size: number
  preference: string
  relayed_by: string
  received: string
  ver: number
  double_spend: boolean
  vin_sz: number
  vout_sz: number
  confirmations: number
  inputs: BlockCypherTransactionInput[]
  outputs: BlockCypherTransactionOutput[]
}

export interface BlockCypherTransactionInput {
  prev_hash: string
  output_index: number
  script: string
  output_value: number
  sequence: number
  addresses: string[]
  script_type: string
}

export interface BlockCypherTransactionOutput {
  value: number
  script: string
  addresses: string[]
  script_type: string
  spent_by: string
}
