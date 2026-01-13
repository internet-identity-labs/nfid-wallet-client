import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { useMemo, useState } from "react"

import { toPresentation } from "@nfid/integration/token/utils"
import { IOption } from "@nfid/ui"
import toaster from "@nfid/ui/atoms/toast"
import { RequestTransferPage } from "@nfid/ui/pages/request-transfer"
import { useTimer } from "@nfid/ui/utils/use-timer"
import { isHex, toUSD } from "@nfid/utils"

import { useICPExchangeRate } from "frontend/features/fungible-token/icp/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useTransfer } from "frontend/integration/wallet/hooks/use-transfer"
import { stringICPtoE8s } from "frontend/integration/wallet/utils"

interface IRequestTransfer {
  applicationName?: string
  applicationLogo?: string
  amountICP: number
  onSuccess: (blockIndex: bigint) => void
  to: string
}

export const RequestTransfer = ({
  amountICP,
  applicationLogo,
  applicationName,
  onSuccess,
  to,
}: IRequestTransfer) => {
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { counter, setCounter } = useTimer({ defaultCounter: -1 })

  const { wallets } = useAllWallets()
  const { exchangeRate } = useICPExchangeRate()

  const selectedWallet = useMemo(() => {
    return wallets?.find(
      (wallet) => wallet.principal.toString() === selectedWallets[0],
    )
  }, [selectedWallets, wallets])

  const { transfer } = useTransfer({
    accountId: selectedWallet?.accountId,
    domain: selectedWallet?.domain,
    transformAmount: stringICPtoE8s,
  })

  const walletsOptions: IOption[] | undefined = useMemo(() => {
    return (
      wallets
        // Added filtering there to avoid changes which should require a lot of re-testing
        ?.filter((wallet) => !wallet.isVaultWallet)
        ?.map((wallet) => ({
          label: wallet.label ?? "",
          value: wallet.principal?.toText() ?? "",
          afterLabel: toPresentation(wallet.balance["ICP"]),
          disabled: Number(wallet.balance) <= Number(amountICP),
        }))
        .sort((a, b) => Number(a?.disabled) - Number(b?.disabled))
    )
  }, [amountICP, wallets])

  const amountUSD = useMemo(() => {
    if (!exchangeRate) return "0"
    return toUSD(amountICP, exchangeRate)
  }, [amountICP, exchangeRate])

  const onApprove = async () => {
    const validAddress = isHex(to)
      ? to
      : AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(to),
        }).toHex()

    try {
      setIsLoading(true)
      const blockIndex = await transfer(validAddress, String(amountICP))
      setCounter(5)
      setTimeout(() => {
        return onSuccess(blockIndex)
      }, 5000)
    } catch (e: any) {
      if (e.message === "InsufficientFunds")
        toaster.error("You don't have enough ICP for this transaction", {
          toastId: "insufficientFundsError",
        })
      else
        toaster.error("Unexpected error: The transaction has been cancelled", {
          toastId: "unexpectedTransferError",
        })
    } finally {
      setIsLoading(false)
    }
  }

  const isInsufficientFunds = useMemo(() => {
    if (!walletsOptions?.length) return false
    return !walletsOptions?.filter((option) => option.disabled !== true).length
  }, [walletsOptions])

  return (
    <RequestTransferPage
      amountICP={amountICP}
      amountUSD={amountUSD}
      walletOptions={walletsOptions ?? []}
      selectedWallets={selectedWallets}
      setSelectedWallets={setSelectedWallets}
      onReject={() => window.close()}
      onApprove={onApprove}
      isLoading={isLoading}
      applicationLogo={applicationLogo ?? ""}
      applicationName={applicationName ?? ""}
      destinationAddress={to}
      successTimer={counter}
      isInsufficientFunds={isInsufficientFunds}
    />
  )
}
