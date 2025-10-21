import { ethereumService } from "frontend/integration/ethereum/ethereum.service"

export const fetchEthAddress = async () => {
  return await ethereumService.getQuickAddress()
}
