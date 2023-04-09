import { ApproverCmpProps } from "frontend/features/embed/types"

import { SendTransaction } from "../ui/send-transaction"

const MappedSell: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  return (
    <SendTransaction
      title="Pre-authorize withdrawal"
      applicationMeta={appMeta}
      network={"Ethereum"}
      totalUSD="@Dmitrii"
      totalToken="@Dmitrii"
      currency={"ETH"}
      onApprove={onConfirm}
      onCancel={onReject}
      assetUrl={rpcMessageDecoded?.data?.meta?.content[0].url}
      assetTitle={rpcMessageDecoded?.data?.meta?.name}
      assetCollectionName={rpcMessageDecoded?.data?.collectionData?.name}
    />
  )
}

export default MappedSell
