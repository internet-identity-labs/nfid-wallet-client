import { Principal } from "@dfinity/principal"
import {
  CapRoot,
  CapRouter,
  prettifyCapTransactions,
} from "@psychedelic/cap-js"
import { TransactionPrettified } from "@psychedelic/cap-js/dist/utils"

const MAIN_NET = "https://mainnet.dfinity.network"

export async function getCapRootTransactions(
  canisterId: string,
  page: number,
): Promise<TransactionPrettified[]> {
  return CapRouter.init({})
    .then((capRouter) =>
      capRouter.get_token_contract_root_bucket({
        tokenId: Principal.fromText(canisterId),
      }),
    )
    .then((rootBucket) => rootBucket.canister[0].toText())
    .then((capCanister) =>
      CapRoot.init({ host: MAIN_NET, canisterId: capCanister }),
    )
    .then((capRoot) => capRoot.get_transactions({ page }))
    .then((l) => l.data.map((event: any) => prettifyCapTransactions(event)))
}
