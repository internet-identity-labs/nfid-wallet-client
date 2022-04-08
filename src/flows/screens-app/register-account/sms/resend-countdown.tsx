import { Button, P } from "@identity-labs/nfid-sdk-react"
import React from "react"

interface ResendSMSProps {
  handleResend: () => void
  defaultCounter: number
}

export const ResendSMS: React.FC<ResendSMSProps> = ({
  handleResend,
  defaultCounter,
}) => {
  const [showResend, setShowResend] = React.useState(true)
  const [counter, setCounter] = React.useState(defaultCounter)

  React.useEffect(() => {
    let timer: NodeJS.Timer

    if (!showResend && counter > 0) {
      timer = setInterval(() => setCounter(counter - 1), 1000)
    } else {
      setShowResend(true)
      setCounter(defaultCounter)
    }

    return () => clearInterval(timer)
  }, [counter, defaultCounter, showResend])

  const handleResendInternal = React.useCallback(() => {
    setShowResend(false)
    handleResend()
  }, [handleResend])

  return showResend ? (
    <P>
      Didn't receive a code?
      <Button text onClick={handleResendInternal} className="!px-1 !py-1 mx-2">
        Resend
      </Button>
    </P>
  ) : (
    <P>
      Code can be resent in <span>{counter} sec</span>
    </P>
  )
}
