import { nfidVaultsService } from "@nfid/integration"
import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { DelegationIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@dfinity/principal"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { ICP_CANISTER_ID, TRIM_ZEROS } from "@nfid/integration/token/constants"
import { FT } from "frontend/integration/ft/ft"
import { VaultTokenBuilder } from "frontend/integration/ft/token-creator/vault-token-builder"
import { fetchTokens } from "frontend/features/fungible-token/utils"

export const fetchVaults = async (principal: Principal) => {
  const address = AccountIdentifier.fromPrincipal({ principal }).toHex()
  const result = await nfidVaultsService.getDashboardCacheForAddress(address)
  return result.cache.map((v) => ({
    canisterId: v.canister,
    name: v.name,
    createdAt: 0,
  }))
}

export const fetchVaultDetails = async (
  canisterId: string,
  identity: DelegationIdentity,
) => {
  const manager = nfidVaultsService.getManager(canisterId, identity)
  const [state, transactions] = await Promise.all([
    manager.getState(),
    manager.getTransactions(),
  ])
  return { state, transactions }
}

export const fetchVaultInitedTokens = async (
  vaultId: string,
  identity: DelegationIdentity,
): Promise<{ initedTokens: FT[]; allTokens: FT[] }> => {
  const [tokens, vaultDetails] = await Promise.all([
    fetchTokens(),
    fetchVaultDetails(vaultId, identity),
  ])

  const vaultPrincipal = Principal.fromText(vaultId)
  const ledgers = new Set(
    vaultDetails.state.icrc1_canisters.map((c) => c.ledger.toText()),
  )
  ledgers.add(ICP_CANISTER_ID)

  const builder = new VaultTokenBuilder(vaultId, vaultPrincipal, identity)

  const allTokens = await Promise.all(
    tokens
      .filter((t) => t.getChainId() === ChainId.ICP)
      .map(async (t) => {
        const feeResponse = await t.getTokenFee()
        return builder.buildTokens({
          ledger: t.getTokenAddress(),
          name: t.getTokenName(),
          symbol: t.getTokenSymbol(),
          decimals: t.getTokenDecimals(),
          category: t.getTokenCategory(),
          logo: t.getTokenLogo(),
          index: t.getTokenIndex(),
          state: ledgers.has(t.getTokenAddress())
            ? State.Active
            : State.Inactive,
          fee: feeResponse.getFee(),
          rootCanisterId: t.getRootSnsCanister()?.toText(),
        })
      }),
  )

  const initedTokens = await Promise.all(
    allTokens
      .filter((t) => t.getTokenState() === State.Active)
      .map((token) => token.init(vaultPrincipal)),
  )

  return { initedTokens, allTokens }
}

export const formatCycles = (cycles: bigint | undefined): string => {
  if (cycles === undefined) return ""
  return `${(Number(cycles) / 1e12).toFixed(3).replace(TRIM_ZEROS, "")} T`
}

// xdrPermyriadPerIcp: how many 1/10000 XDR equal 1 ICP (from NNS cycles minting canister)
// 1 XDR = 1 T cycles (1_000_000_000_000)

export const icpToTCycles = (
  icpAmount: number,
  xdrPermyriadPerIcp: bigint,
): number => {
  const xdrPerIcp = Number(xdrPermyriadPerIcp) / 10_000
  return icpAmount * xdrPerIcp
}

export const tCyclesToIcp = (
  tCycles: number,
  xdrPermyriadPerIcp: bigint,
): number => {
  const xdrPerIcp = Number(xdrPermyriadPerIcp) / 10_000
  return tCycles / xdrPerIcp
}
