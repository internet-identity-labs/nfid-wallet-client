import { CapRoot, CapRouter } from "@psychedelic/cap-js"
import { Principal } from "@dfinity/principal"

const MAIN_NET = "https://mainnet.dfinity.network";

export async function getTokenTransactionHistory(
  canisterId: string, page: number,
) {
  let capRouter = await CapRouter.init({})
  let rootBucket = await capRouter.get_token_contract_root_bucket({ tokenId: Principal.fromText(canisterId) })
  let capCanister = rootBucket.canister[0].toText()
  let capRoot = await CapRoot.init({ host: MAIN_NET, canisterId: capCanister })
  return await capRoot.get_transactions({ page })
}

export async function getUserTransactions(
  canisterId: string, user: Principal, page: number,
) {
  let capRouter = await CapRouter.init({})
  let rootBucket = await capRouter.get_token_contract_root_bucket({ tokenId: Principal.fromText(canisterId) })
  let capCanister = rootBucket.canister[0].toText()
  let capRoot = await CapRoot.init({ host: MAIN_NET, canisterId: capCanister })
  return await capRoot.get_user_transactions({ page, user })
}

export async function getTokenTxHistoryOfTokenIndex(
  canisterId: string, tokenId: bigint, page: number,
) {
  let capRouter = await CapRouter.init({})
  let rootBucket = await capRouter.get_token_contract_root_bucket({ tokenId: Principal.fromText(canisterId) })
  let capCanister = rootBucket.canister[0].toText()
  let capRoot = await CapRoot.init({ host: MAIN_NET, canisterId: capCanister })
  let a = await capRoot.get_token_transactions({ page, token_id: tokenId })
  return a
}
