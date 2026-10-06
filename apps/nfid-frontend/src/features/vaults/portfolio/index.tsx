import { FC, useContext } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { VaultPortfolio } from "packages/ui/src/organisms/vaults/portfolio"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"
import { DelegationIdentity } from "@dfinity/identity"
import { fetchVaultDetails, fetchVaultInitedTokens } from "../utils"
import { useSWR } from "@nfid/swr"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { portfolioService } from "frontend/integration/portfolio-balance/portfolio-service"
import {
  ModalType,
  SelectedToken,
} from "frontend/features/transfer-modal/types"
import { ProfileContext } from "frontend/provider"

export type VaultPortfolioProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultPortfolioPage: FC<VaultPortfolioProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const { vaultId } = useParams<{ vaultId: string }>()
  const { identity } = useIdentity()
  const globalServices = useContext(ProfileContext)

  const {
    data: vault,
    isLoading,
    mutate: updateVault,
  } = useSWR(
    vaultId && identity ? `vault-details-${vaultId}` : null,
    () => fetchVaultDetails(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const {
    data: vaultTokens,
    isLoading: isTokensLoading,
    mutate,
  } = useSWR(
    vaultId && identity ? ["vaultInitedTokens", vaultId] : null,
    () => fetchVaultInitedTokens(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const initedTokens = vaultTokens?.initedTokens ?? []
  const allTokens = vaultTokens?.allTokens ?? []

  const { data: usdBalance, isLoading: isUsdLoading } = useSWR(
    initedTokens.length ? ["vaultUsdBalance", vaultId] : null,
    () => portfolioService.getVaultPortfolioUSDBalance(initedTokens),
    { revalidateOnFocus: false },
  )

  const updateTokens = async () => {
    await updateVault()
    mutate()
  }

  const onSendClick = (selectedToken: SelectedToken) => {
    globalServices.transferService.send({
      type: "ASSIGN_VAULTS_CANISTER",
      data: vaultId || "",
    })
    globalServices.transferService.send({
      type: "ASSIGN_SOURCE_WALLET",
      data: "",
    })
    globalServices.transferService.send({
      type: "ASSIGN_SELECTED_FT",
      data: selectedToken,
    })
    globalServices.transferService.send({
      type: "CHANGE_TOKEN_TYPE",
      data: "ft",
    })
    globalServices.transferService.send({
      type: "CHANGE_DIRECTION",
      data: ModalType.SEND,
    })
    globalServices.transferService.send({ type: "SHOW" })
  }

  return (
    <ProfileTemplate
      pageTitle="Portfolio"
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}/${vaultId}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1] mb-[22px]"
    >
      <VaultPortfolio
        isLoading={isLoading || !identity}
        isTokensLoading={isTokensLoading}
        isUsdLoading={isUsdLoading || isTokensLoading}
        usdBalance={usdBalance}
        tokens={initedTokens}
        allTokens={allTokens}
        vault={vault?.state}
        updateVault={updateTokens}
        onSendClick={onSendClick}
      />
    </ProfileTemplate>
  )
}

export default VaultPortfolioPage
