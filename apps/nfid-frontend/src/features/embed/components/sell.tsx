import { useMemo } from "react"

import { ApproverCmpProps } from "frontend/features/embed/types"
import { useExchangeRates } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"

import { SendTransaction } from "../ui/send-transaction"

const MappedSell: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  const { rates } = useExchangeRates()

  const price = useMemo(() => {
    if (!rates) return
    // @ts-ignore
    // Sell type hotfix for demo
    const total = rpcMessageDecoded?.total
    const totalUSD = (parseFloat(total) * rates["ETH"]).toFixed(2)
    return { total, totalUSD }
  }, [rates, rpcMessageDecoded])

  return (
    <SendTransaction
      title="Sell collectible"
      applicationMeta={appMeta}
      network={"Ethereum"}
      // @ts-ignore
      // Sell type hotfix for demo
      fromAddress={rpcMessageDecoded?.from}
      totalToken={price?.total}
      totalUSD={String(price?.totalUSD)}
      currency={"ETH"}
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
