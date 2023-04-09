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
    return rpcMessageDecoded?.data.royalties.map((user: any) => ({
      account: user?.creator,
      value: user?.value,
    }))
  }, [rpcMessageDecoded?.data.royalties])

  const creators = useMemo(() => {
    return rpcMessageDecoded?.data.creators.map((user: any) => ({
      account: user?.creator,
      value: user?.value,
    }))
  }, [rpcMessageDecoded?.data.creators])

  return (
    <SignTypedData
      applicationMeta={appMeta}
      onApprove={onConfirm}
      onCancel={onReject}
      creators={creators}
      royalties={royalties}
      tokenId={rpcMessageDecoded?.data?.tokenId}
      tokenURI={rpcMessageDecoded?.data?.tokenURI}
    />
  )
}
export default MappedLazyMintComponent
