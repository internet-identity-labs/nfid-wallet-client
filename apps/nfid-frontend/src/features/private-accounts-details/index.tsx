import { PrivateAccountDetails } from "packages/ui/src/organisms/private-accounts-details"
import { FC, useMemo } from "react"
import { useParams } from "react-router-dom"

import { Loader } from "@nfid-frontend/ui"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { NFIDTheme } from "frontend/App"
import { NotFound } from "@nfid-frontend/ui"
import { ProfileTemplate } from "@nfid-frontend/ui"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ftService } from "frontend/integration/ft/ft-service"

type PrivateAccountDetailsProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const PrivateAccountDetailsPage: FC<PrivateAccountDetailsProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const { dappId } = useParams()

  const { data: privateAccounts, isLoading: myAppsLoading } = useSWR(
    "privateAccounts",
    async () => icrc1OracleService.getMyDiscoveryApps(),
    { revalidateOnFocus: false },
  )

  const { data: discoveryApps, isLoading: appsLoading } = useSWR(
    "discoveryApps",
    async () => icrc1OracleService.getDiscoveryApps(),
    { revalidateOnFocus: false },
  )

  const dapp = useMemo(() => {
    if (!privateAccounts || !discoveryApps || !dappId) return

    const app = discoveryApps.find((app) => app.id === Number(dappId))
    const account = privateAccounts.find(
      (app) => app.appId === Number(dappId),
    )?.anonymousPrincipal

    if (!app || !account) return

    return {
      app,
      account,
    }
  }, [discoveryApps, privateAccounts, dappId])

  const { data: tokens = undefined } = useSWRWithTimestamp(
    dapp ? ["tokens", dapp.account] : null,
    () => {
      if (!dapp) return
      return ftService.getIcpViewOnlyTokens(dapp.account)
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  )

  const { initedTokens, isLoading: isTokensLoading } = useTokensInit(
    tokens,
    dapp?.account,
  )

  if (myAppsLoading || appsLoading) return <Loader isLoading />
  if (!dapp) return <NotFound hideNavigation />

  return (
    <ProfileTemplate
      pageTitle={dapp.app.name}
      showBackButton
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      className="w-full z-[1]"
    >
      <PrivateAccountDetails
        dappInfo={dapp}
        tokens={initedTokens}
        isTokensLoading={isTokensLoading}
      />
    </ProfileTemplate>
  )
}

export default PrivateAccountDetailsPage
