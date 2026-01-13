import { Utxo } from "@dfinity/ckbtc"

import { SendEthFee } from "../ethereum/evm.service"

export interface FeeResponse {
  getFee(): bigint
}

export class FeeResponseICP implements FeeResponse {
  private fee: bigint

  constructor(fee: bigint) {
    this.fee = fee
  }

  getFee() {
    return this.fee
  }
}

export class FeeResponseBTC implements FeeResponse {
  private fee: bigint
  private utxos: Utxo[]

  constructor(fee: bigint, utxos: Utxo[]) {
    this.fee = fee
    this.utxos = utxos
  }

  getFee() {
    return this.fee
  }

  getUtxos() {
    return this.utxos
  }
}

export class FeeResponseETH implements FeeResponse {
  private fee: bigint
  private gasUsed: bigint
  private maxPriorityFeePerGas: bigint
  private maxFeePerGas: bigint
  private baseFeePerGas: bigint

  constructor(feeData: SendEthFee) {
    this.fee = feeData.ethereumNetworkFee
    this.gasUsed = feeData.gasUsed
    this.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
    this.maxFeePerGas = feeData.maxFeePerGas
    this.baseFeePerGas = feeData.baseFeePerGas
  }

  getFee() {
    return this.fee
  }

  getGasUsed() {
    return this.gasUsed
  }

  getMaxPriorityFeePerGas() {
    return this.maxPriorityFeePerGas
  }

  getMaxFeePerGas() {
    return this.maxFeePerGas
  }

  getBaseFeePerGas() {
    return this.baseFeePerGas
  }
}
