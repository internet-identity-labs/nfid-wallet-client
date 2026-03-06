import { ETH_DECIMALS, ETH_NATIVE_ID } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMNativeTransactionService } from "../../evm-transaction.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class EthSepoliaTransactionService extends EVMNativeTransactionService {
  protected getChainId(): number {
    return ChainId.ETH_SEPOLIA
  }

  protected getCurrency(): string {
    return "ETH"
  }

  protected getIcon(): string {
    return EthIcon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return ETH_NATIVE_ID
  }

  public getExplorerLink(txId: string): string {
    return `https://sepolia.etherscan.io/tx/${txId}`
  }
}

export const ethSepoliaTransactionService = new EthSepoliaTransactionService()
