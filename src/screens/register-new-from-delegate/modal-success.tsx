import { Modal } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { useTimer } from "frontend/hooks/use-timer"

interface ModalSuccessProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClick: () => void
  device?: string
}

export const ModalSuccess: React.FC<ModalSuccessProps> = ({
  onClick,
  device,
}) => {
  const handleClose = React.useCallback(() => {
    onClick()
    setTimeout(window.close, 300)
  }, [onClick])

  return (
    <Modal
      title={"All set!"}
      description={`You can now use this ${device} to quickly and securely sign in with NFID.`}
      iconType="success"
      buttonText="Try it now"
      onClick={handleClose}
    />
  )
}
