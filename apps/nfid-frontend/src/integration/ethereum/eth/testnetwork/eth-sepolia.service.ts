import { InfuraProvider } from "ethers"
import {
  SEPOLIA_MINTER_ADDRESS,
  CKSEPOLIA_MINTER_CANISTER_ID,
  CKSEPOLIA_LEDGER_CANISTER_ID,
  CKSEPOLIA_NETWORK_FEE,
} from "@nfid/integration/token/constants"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { EVMService } from "../../evm.service"
import { getInfuraProvider } from "../../infura-provider-registry"

export class EthSepoliaService extends EVMService {
  protected provider: InfuraProvider
  protected minterAddress = SEPOLIA_MINTER_ADDRESS
  protected ckEthMinterCanisterId = CKSEPOLIA_MINTER_CANISTER_ID
  protected ckEthLedgerCanisterId = CKSEPOLIA_LEDGER_CANISTER_ID
  protected ckEthNetworkFee = CKSEPOLIA_NETWORK_FEE

  constructor() {
    super()
    this.provider = getInfuraProvider(ChainId.ETH_SEPOLIA)
  }
}

export const ethSepoliaService = new EthSepoliaService()
