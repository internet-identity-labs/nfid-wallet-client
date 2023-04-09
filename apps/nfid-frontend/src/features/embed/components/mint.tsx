import { useMemo } from "react"

import { IWarningAccordionOption } from "@nfid-frontend/ui"

import { ApproverCmpProps } from "frontend/features/embed/types"
import { calcPrice } from "frontend/features/embed/util/calcPriceUtil"
import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

import { SendTransaction } from "../ui/send-transaction"

const MappedMintComponent: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessage,
  rpcMessageDecoded,
  populatedTransaction,
  onConfirm,
  onReject,
}) => {
  const { rates } = useExchangeRates()

  const price = useMemo(() => {
    return calcPrice(rates, populatedTransaction)
  }, [rates, populatedTransaction])

  const warnings = useMemo(() => {
    if (!price) return []
    let warnings: IWarningAccordionOption[] = []

    if (
      !rpcMessageDecoded?.data?.meta?.content[0].url &&
      !rpcMessageDecoded?.data?.meta?.name &&
      rpcMessageDecoded?.data?.collectionData?.name
    )
      warnings.push({
        title: "Preview unavailable",
        subtitle:
          "Unable to estimate asset changes. Please make sure you trust this dapp.",
      })

    if (price.isNetworkIsBusyWarning)
      warnings.push({
        title: "Network is busy",
        subtitle: (
          <>
            Gas prices are high and estimates are less accurate.
            <span className="text-blue-600"> Adjust the network fee.</span>
          </>
        ),
      })

    return warnings
  }, [
    price,
    rpcMessageDecoded?.data?.collectionData?.name,
    rpcMessageDecoded?.data?.meta?.content,
    rpcMessageDecoded?.data?.meta?.name,
  ])
  return (
    <SendTransaction
      title="Mint collectible"
      applicationMeta={appMeta}
      fromAddress={rpcMessage?.params[0].from}
      toAddress={rpcMessage?.params[0].to}
      network={"Ethereum"}
      networkFee={price.feeUsd}
      totalUSD={price.totalUsd}
      totalToken={price.total}
      currency={"ETH"}
      onApprove={onConfirm}
      isInsufficientBalance={price.isInsufficientFundsError}
      warnings={warnings}
      onCancel={onReject}
      assetUrl={rpcMessageDecoded?.data?.meta?.content[0].url}
      assetTitle={rpcMessageDecoded?.data?.meta?.name}
      assetCollectionName={rpcMessageDecoded?.data?.collectionData?.name}
    />
  )
}

export default MappedMintComponent
