import { useMemo } from "react"

import { ApproverCmpProps } from "frontend/features/embed/types"

import { SignTypedData } from "../ui/sign-typed"

const MappedLazyMintComponent: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  const royalties = useMemo(() => {
    return rpcMessageDecoded?.data?.royalties ?? []
  }, [rpcMessageDecoded?.data.royalties])

  const creators = useMemo(() => {
    return rpcMessageDecoded?.data?.creators ?? []
  }, [rpcMessageDecoded?.data.creators])

  return (
    <SignTypedData
      applicationMeta={appMeta}
      onApprove={onConfirm}
      onCancel={onReject}
      creators={creators}
      royalties={royalties}
      tokenId={rpcMessageDecoded?.data?.tokenId}
      tokenURI={rpcMessageDecoded?.data?.uri}
    />
  )
}
export default MappedLazyMintComponent
