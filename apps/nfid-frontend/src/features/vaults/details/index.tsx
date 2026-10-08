import { FC, useContext } from "react"
import { useParams } from "react-router-dom"

import { ProfileTemplate } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"
import { VaultDetails } from "packages/ui/src/organisms/vaults/details"

import { NFIDTheme } from "frontend/App"
import { useIdentity } from "frontend/hooks/identity"

import { DelegationIdentity } from "@icp-sdk/core/identity"
import {
  fetchVaultDeposits,
  fetchVaultDetails,
  fetchVaultInitedTokens,
} from "../utils"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { portfolioService } from "frontend/integration/portfolio-balance/portfolio-service"
import { ProfileContext } from "frontend/provider"
import { ModalType } from "frontend/features/transfer-modal/types"
import { nfidVaultsService } from "@nfid/integration"
import {
  ICP_CANISTER_ID,
  ICP_DECIMALS,
  WALLET_FEE,
  TRILLION,
} from "@nfid/integration/token/constants"

type VaultDetailsProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const VaultDetailsPage: FC<VaultDetailsProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const globalServices = useContext(ProfileContext)
  const { vaultId } = useParams<{ vaultId: string }>()
  const { identity } = useIdentity()

  const {
    data: vault,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    vaultId && identity ? `vault-details-${vaultId}` : null,
    () => fetchVaultDetails(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const { data: vaultTokens, isLoading: isTokensLoading } = useSWR(
    vaultId && identity ? ["vaultInitedTokens", vaultId] : null,
    () => fetchVaultInitedTokens(vaultId!, identity! as DelegationIdentity),
    { revalidateOnFocus: false },
  )

  const initedTokens = vaultTokens?.initedTokens ?? []

  const { data: usdBalance, isLoading: isUsdLoading } = useSWR(
    initedTokens.length ? ["vaultUsdBalance", vaultId] : null,
    () => portfolioService.getVaultPortfolioUSDBalance(initedTokens),
    { revalidateOnFocus: false },
  )

  const { data: cyclesBalance } = useSWR(
    vaultId && identity ? ["vault-cycles", vaultId] : null,
    () => nfidVaultsService.getCyclesBalance(vaultId!, identity!),
  )

  const { data: xdrPermyriadPerIcp } = useSWR(
    identity ? "xdr-permyriad-per-icp" : null,
    () => nfidVaultsService.getXdrPermyriadPerIcp(identity!),
  )

  const { data: deposits } = useSWR(
    vaultId && vaultTokens ? ["vault-deposits", vaultId] : null,
    () => fetchVaultDeposits(vaultId!, vaultTokens!.initedTokens),
    { revalidateOnFocus: false },
  )

  const icpTokenBalance = vaultTokens?.initedTokens
    .find((t) => t.getTokenAddress() === ICP_CANISTER_ID)
    ?.getTokenBalance()

  const vaultIcpBalance =
    icpTokenBalance !== undefined
      ? Number(icpTokenBalance) / 10 ** ICP_DECIMALS - WALLET_FEE
      : undefined

  const topUp = async (amount: string) => {
    if (!vaultId || !identity) return
    const amountRaw = BigInt(Math.round(Number(amount) * 10 ** ICP_DECIMALS))
    await nfidVaultsService.topUp(vaultId, identity, amountRaw)
  }

  const onSendClick = () => {
    globalServices.transferService.send({
      type: "ASSIGN_VAULTS_CANISTER",
      data: vaultId || "",
    })
    globalServices.transferService.send({
      type: "ASSIGN_SOURCE_WALLET",
      data: "",
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

  const onReceiveClick = () => {
    globalServices.transferService.send({
      type: "ASSIGN_VAULTS_CANISTER",
      data: vaultId || "",
    })
    globalServices.transferService.send({
      type: "ASSIGN_SOURCE_WALLET",
      data: "",
    })
    globalServices.transferService.send({
      type: "CHANGE_DIRECTION",
      data: ModalType.RECEIVE,
    })
    globalServices.transferService.send({ type: "SHOW" })
  }

  return (
    <ProfileTemplate
      pageTitle={vault?.state?.name}
      showBackButton
      backButtonPathname={`${ProfileConstants.vaults}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1]"
    >
      <VaultDetails
        vault={vault}
        vaultId={vaultId}
        tokens={vaultTokens?.allTokens ?? []}
        refreshPortfolio={mutate}
        isLoading={isValidating || isLoading || !identity}
        isUsdLoading={isUsdLoading || isTokensLoading}
        usdBalance={usdBalance}
        onSendClick={onSendClick}
        onReceiveClick={onReceiveClick}
        isLowCyclesBalance={!!cyclesBalance && cyclesBalance < TRILLION}
        xdrPermyriadPerIcp={xdrPermyriadPerIcp}
        topUp={topUp}
        vaultIcpBalance={vaultIcpBalance}
        deposits={deposits}
      />
    </ProfileTemplate>
  )
}

export default VaultDetailsPage
