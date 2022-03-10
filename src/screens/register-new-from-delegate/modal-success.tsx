import React from "react"
import { Modal } from "frontend/ui-kit/src"
import { useTimer } from "frontend/hooks/use-timer"

interface ModalSuccessProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClick: () => void
}

export const ModalSuccess: React.FC<ModalSuccessProps> = ({ onClick }) => {
  const { elapsed, counter } = useTimer({
    defaultCounter: 10,
  })

  const handleClose = React.useCallback(() => {
    onClick()
    setTimeout(window.close, 300)
  }, [onClick])

  React.useEffect(() => {
    if (elapsed) {
      handleClose()
    }
  }, [elapsed, handleClose, onClick])

  return (
    <Modal
      title={"This device is now equipped for Web 3.0"}
      description={`You can click done to proceed. This window will automatically close in ${counter} seconds.`}
      iconType="success"
      buttonText="Done"
      onClick={handleClose}
    />
  )
}
