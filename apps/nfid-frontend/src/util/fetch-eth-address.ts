import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"

export const fetchEthAddress = async () => {
  return await ethereumService.getQuickAddress()
}
