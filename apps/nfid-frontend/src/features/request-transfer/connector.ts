import { DelegationIdentity } from "@dfinity/identity"

import {
  TokenBalance,
  TokenFee,
} from "frontend/ui/connnector/transfer-modal/types"

import {
  IRequestTransfer,
  IRequestTransferConnector,
  IRequestTransferResponse,
  RequestTransferConfig,
} from "./types"

export abstract class RequestTransferConnector<T extends RequestTransferConfig>
  implements IRequestTransferConnector
{
  protected config: T

  constructor(config: T) {
    this.config = config
  }

  abstract getBalance(): Promise<number>
  abstract getRate(currency: string): Promise<number>
  abstract getFee(request?: IRequestTransfer): Promise<TokenFee>
  abstract getIdentity(): Promise<DelegationIdentity>
  abstract transfer(
    request: IRequestTransfer,
  ): Promise<IRequestTransferResponse>
}
