import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import EthIcon from "@nfid/ui/organisms/tokens/assets/ethereum.svg"

import { EVMNativeTransactionService } from "../evm-transaction.service"

export class PolygonTransactionService extends EVMNativeTransactionService {
  protected getChainId(): number {
    return ChainId.POL
  }

  protected getCurrency(): string {
    return "POL"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Polygon icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return EVM_NATIVE
  }

  public getExplorerLink(txId: string): string {
    return `https://polygonscan.com/tx/${txId}`
  }
}

export const polygonTransactionService = new PolygonTransactionService()
