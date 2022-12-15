import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useMemo, useState } from "react"
import { toast } from "react-toastify"

import { toPresentation } from "@nfid/integration/token/icp"

import { icpToUSD } from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { useICPExchangeRate } from "frontend/integration/rosetta/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useTransfer } from "frontend/integration/wallet/hooks/use-transfer"
import { IOption } from "frontend/ui/atoms/dropdown-select"
import { RequestTransferPage } from "frontend/ui/pages/request-transfer"
import { isHex } from "frontend/ui/utils"
import { useTimer } from "frontend/ui/utils/use-timer"

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
  })

  const walletsOptions: IOption[] | undefined = useMemo(() => {
    return wallets
      ?.map((wallet) => ({
        label: wallet.label ?? "",
        value: wallet.principal?.toText() ?? "",
        afterLabel: toPresentation(wallet.balance),
        disabled: Number(wallet.balance) <= Number(amountICP),
      }))
      .sort((a, b) => Number(a?.disabled) - Number(b?.disabled))
  }, [amountICP, wallets])

  const amountUSD = useMemo(() => {
    if (!exchangeRate) return "0"
    return icpToUSD(amountICP, exchangeRate)
  }, [amountICP, exchangeRate])

  const onApprove = async () => {
    let validAddress = isHex(to)
      ? to
      : principalToAddress(Principal.fromText(to) as any)

    try {
      setIsLoading(true)
      const blockIndex = await transfer(validAddress, String(amountICP))
      setCounter(5)
      setTimeout(() => {
        return onSuccess(blockIndex)
      }, 5000)
    } catch (e: any) {
      if (e.message === "InsufficientFunds")
        toast.error("You don't have enough ICP for this transaction", {
          toastId: "insufficientFundsError",
        })
      else
        toast.error("Unexpected error: The transaction has been cancelled", {
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
