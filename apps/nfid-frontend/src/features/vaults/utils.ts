import { nfidVaultsService } from "@nfid/integration"
import { DelegationIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@dfinity/principal"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { FT } from "frontend/integration/ft/ft"
import { VaultTokenBuilder } from "frontend/integration/ft/token-creator/vault-token-builder"
import { fetchTokens } from "frontend/features/fungible-token/utils"

export const fetchVaults = async () => nfidVaultsService.getVaults()

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

  const allTokens = tokens
    .filter((t) => t.getChainId() === ChainId.ICP)
    .map((t) =>
      builder.buildTokens({
        ledger: t.getTokenAddress(),
        name: t.getTokenName(),
        symbol: t.getTokenSymbol(),
        decimals: t.getTokenDecimals(),
        category: t.getTokenCategory(),
        logo: t.getTokenLogo(),
        index: t.getTokenIndex(),
        state: ledgers.has(t.getTokenAddress()) ? State.Active : State.Inactive,
        fee: BigInt(0),
        rootCanisterId: t.getRootSnsCanister()?.toText(),
      }),
    )

  const initedTokens = await Promise.all(
    allTokens
      .filter((t) => t.getTokenState() === State.Active)
      .map((token) => token.init(vaultPrincipal)),
  )

  return { initedTokens, allTokens }
}
