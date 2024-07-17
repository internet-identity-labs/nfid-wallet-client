import { chainService } from "packages/integration-ethereum/src/lib/decoder/chain-service"
import { useMemo } from "react"

import { ApproverCmpProps } from "frontend/features/embed/types"
import { useExchangeRates } from "frontend/features/fungible-token/eth/hooks/use-eth-exchange-rate"

import { SendTransaction } from "../ui/send-transaction"

const MappedSell: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessage,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  const { rates } = useExchangeRates()
  const { symbol, currency, chainName } = chainService.getSymbolAndChainName(
    rpcMessage.options.chainId,
  )
  const rate = rates[currency]

  const price = useMemo(() => {
    if (!rate || !rpcMessageDecoded?.total) return

    const total = rpcMessageDecoded?.total
    const totalUSD = (parseFloat(total) * rate).toFixed(2)
    return { total, totalUSD }
  }, [rate, rpcMessageDecoded])

  return (
    <SendTransaction
      title="Sell collectible"
      applicationMeta={appMeta}
      fromAddress={rpcMessageDecoded?.from}
      totalToken={String(price?.total) ?? "0"}
      totalUSD={String(price?.totalUSD) ?? "0"}
      network={chainName}
      currency={symbol}
      onApprove={onConfirm}
      onCancel={onReject}
      assets={[
        {
          icon: rpcMessageDecoded?.data?.meta?.content[0].url,
          title: rpcMessageDecoded?.data?.meta?.name,
          subtitle: rpcMessageDecoded?.data?.collectionData?.name,
        },
      ]}
    />
  )
}

export default MappedSell
