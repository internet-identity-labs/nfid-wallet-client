import { ApproverCmpProps } from "frontend/features/embed/types"

import { PersonalSign } from "../ui/personal-sign"

const MappedSignMessage: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  return (
    <PersonalSign
      applicationMeta={appMeta}
      message={rpcMessageDecoded?.data?.message ?? ""}
      onApprove={onConfirm}
      onCancel={onReject}
    />
  )
}

export default MappedSignMessage
