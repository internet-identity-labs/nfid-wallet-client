import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { icpToUSD } from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { useICPExchangeRate } from "frontend/integration/rosetta/hooks/use-icp-exchange-rate"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { useTransfer } from "frontend/integration/wallet/hooks/use-transfer"
import { IOption } from "frontend/ui/atoms/dropdown-select"
import { RequestTransferPage } from "frontend/ui/pages/request-transfer"
import { isHex } from "frontend/ui/utils"

interface IRequestTransfer {
  applicationName?: string
  applicationLogo?: string
  amountICP: number
  onSuccess: () => void
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

  const { wallets } = useAllWallets()
  const { exchangeRate } = useICPExchangeRate()

  const selectedWallet = useMemo(() => {
    return wallets?.find(
      (wallet) => wallet.principal.toString() === selectedWallets[0],
    )
  }, [selectedWallets])

  const { transfer } = useTransfer({
    accountId: selectedWallet?.accountId,
    domain: selectedWallet?.domain,
  })

  const walletsOptions: IOption[] | undefined = useMemo(() => {
    return wallets
      ?.map((wallet) => ({
        label: wallet.label ?? "",
        value: wallet.principal?.toText() ?? "",
        afterLabel: wallet.balance.value,
        disabled: Number(wallet.balance.value) <= Number(amountICP),
      }))
      .sort((a, b) => Number(a?.disabled) - Number(b?.disabled))
  }, [wallets])

  const amountUSD = useMemo(() => {
    if (!exchangeRate) return "0"
    return icpToUSD(amountICP.toString(), exchangeRate)
  }, [amountICP, exchangeRate])

  const onApprove = async () => {
    let validAddress = isHex(to)
      ? to
      : principalToAddress(Principal.fromText(to) as any)

    try {
      setIsLoading(true)
      await transfer(validAddress, String(amountICP))
      onSuccess()
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

  return (
    <RequestTransferPage
      amountICP={amountICP}
      amountUSD={amountUSD}
      walletOptions={walletsOptions ?? []}
      selectedWallets={selectedWallets}
      setSelectedWallets={setSelectedWallets}
      onReject={() => window.close()}
      onApprove={onApprove}
      isSuccess={false}
      isLoading={isLoading}
    />
  )
}
