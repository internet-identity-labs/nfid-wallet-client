
export interface RosettaBalance {
  "block_identifier": {
    "index": number,
    "hash": string
  },
  "balances": [
    {
      "value": string,
      "currency": {
        "symbol": string,
        "decimals": number,
        "metadata": {
          "Issuer": string
        }
      },
      "metadata": object
    }
  ],
  "metadata": {
    "sequence_number": number
  }
}

export interface Balance {
  "value": string,
  "currency": {
    "symbol": string,
    "decimals": number,
    "metadata": {
      "Issuer": string
    }
  }
}

export interface XdrUsd {
  "XDR_USD": string,
}

export interface TransactionHistory {

}
