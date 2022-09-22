import { CapRoot, CapRouter } from "@psychedelic/cap-js"
import { Principal } from "@dfinity/principal"
const MAIN_NET = "https://mainnet.dfinity.network"


export async function getCapRoot(canisterId: string) {
  return CapRouter.init({})
    .then((capRouter) => capRouter.get_token_contract_root_bucket({ tokenId: Principal.fromText(canisterId) }))
    .then((rootBucket) => rootBucket.canister[0].toText())
    .then((capCanister) => CapRoot.init({ host: MAIN_NET, canisterId: capCanister }))
}
