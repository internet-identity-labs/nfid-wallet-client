import { Image } from "@nfid-frontend/ui"

import ErrorIcon from "frontend/assets/toast-icons/error.svg"
import InfoIcon from "frontend/assets/toast-icons/info.svg"
import SuccessIcon from "frontend/assets/toast-icons/success.svg"
import WarningIcon from "frontend/assets/toast-icons/warning.svg"

export const ToastIcons: { [key: string]: JSX.Element } = {
  success: <Image src={SuccessIcon} alt="success" />,
  info: <Image src={InfoIcon} alt="info" />,
  error: <Image src={ErrorIcon} alt="error" />,
  warning: <Image src={WarningIcon} alt="warning" />,
}
