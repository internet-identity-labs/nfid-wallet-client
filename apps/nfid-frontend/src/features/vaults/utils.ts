import { nfidVaultsService } from "@nfid/integration"

export const fetchVaults = async () => nfidVaultsService.getVaults()
