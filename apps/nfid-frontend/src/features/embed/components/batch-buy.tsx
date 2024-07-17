import { chainService } from "packages/integration-ethereum/src/lib/decoder/chain-service"
import { useMemo } from "react"

import { IWarningAccordionOption } from "@nfid-frontend/ui"
import { Item } from "@nfid/integration-ethereum"

import { ApproverCmpProps } from "frontend/features/embed/types"
import { calcPrice } from "frontend/features/embed/util/calcPriceUtil"
import { toUSD } from "frontend/features/fungible-token/accumulate-app-account-balances"
import { useExchangeRates } from "frontend/features/fungible-token/eth/hooks/use-eth-exchange-rate"

import { SendTransaction } from "../ui/send-transaction"

const MappedBuy: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessage,
  rpcMessageDecoded,
  populatedTransaction,
  disableConfirmButton,
  onConfirm,
  onReject,
}) => {
  const { rates } = useExchangeRates()
  const { symbol, currency, chainName } = chainService.getSymbolAndChainName(
    rpcMessage.options.chainId,
  )
  const rate = rates[currency]

  const price = useMemo(() => {
    return calcPrice(rate, populatedTransaction)
  }, [rate, populatedTransaction])

  const warnings = useMemo(() => {
    if (!price) return []
    let warnings: IWarningAccordionOption[] = []

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
  }, [price])

  const assets = useMemo(() => {
    return rpcMessageDecoded?.data?.items?.map(
      (item: { amount: string; fee: string; item: { data: Item } }) => ({
        icon: item?.item?.data?.meta?.content[0]?.url,
        title: item?.item?.data?.meta?.name,
        subtitle: item?.item?.data?.collectionData?.name,
        innerTitle: Number(item?.amount) / 10 ** 18 + " ETH",
        innerSubtitle: toUSD(Number(item?.amount) / 10 ** 18, rates["ETH"]),
      }),
    )
  }, [rates, rpcMessageDecoded?.data?.items])

  const total = useMemo(() => {
    if (!populatedTransaction) return

    return String(Number(populatedTransaction[0]?.value) / 10 ** 18)
  }, [populatedTransaction])

  return (
    <SendTransaction
      title="Buy multiple collectibles"
      applicationMeta={appMeta}
      fromAddress={rpcMessage?.params[0].from}
      toAddress={rpcMessage?.params[0].to}
      network={chainName}
      currency={symbol}
      networkFee={price.fee}
      totalUSD={price.totalUsd}
      totalToken={price.total}
      price={total}
      onApprove={onConfirm}
      disableApproveButton={disableConfirmButton}
      isInsufficientBalance={price.isInsufficientFundsError}
      warnings={warnings}
      onCancel={onReject}
      assets={assets}
    />
  )
}

export default MappedBuy
