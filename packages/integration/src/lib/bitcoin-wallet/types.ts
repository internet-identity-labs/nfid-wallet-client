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
