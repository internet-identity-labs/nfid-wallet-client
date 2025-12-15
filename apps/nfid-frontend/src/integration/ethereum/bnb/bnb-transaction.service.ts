import { ETH_DECIMALS, EVM_NATIVE } from "@nfid/integration/token/constants"

import EthIcon from "packages/ui/src/organisms/tokens/assets/ethereum.svg"

import { EVMNativeTransactionService } from "../evm-transaction.service"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export class BnbTransactionService extends EVMNativeTransactionService {
  protected getChainId(): number {
    return ChainId.BNB
  }

  protected getCurrency(): string {
    return "BNB"
  }

  protected getIcon(): string {
    return EthIcon //TODO: Add Arbitrum icon
  }

  protected getDecimals(): number {
    return ETH_DECIMALS
  }

  protected getCanister(): string {
    return EVM_NATIVE
  }
}

export const bnbTransactionService = new BnbTransactionService()
