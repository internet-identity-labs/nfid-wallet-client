import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"

import PolIcon from "packages/ui/src/organisms/tokens/assets/polygon.svg"

import { EVMNativeTransactionService } from "../../evm-transaction.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class PolygonAmoyTransactionService extends EVMNativeTransactionService {
  protected getChainId(): number {
    return ChainId.POL_AMOY
  }

  protected getCurrency(): string {
    return "POL"
  }

  protected getIcon(): string {
    return PolIcon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return EVM_NATIVE
  }

  public getExplorerLink(txId: string): string {
    return `https://amoy.polygonscan.com/tx/${txId}`
  }
}

export const polygonAmoyTransactionService = new PolygonAmoyTransactionService()
