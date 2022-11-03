import ErrorIcon from "frontend/assets/toast-icons/error.svg"
import InfoIcon from "frontend/assets/toast-icons/info.svg"
import SuccessIcon from "frontend/assets/toast-icons/success.svg"
import WarningIcon from "frontend/assets/toast-icons/warning.svg"

export const ToastIcons: { [key: string]: JSX.Element } = {
  success: <img src={SuccessIcon} alt="success" />,
  info: <img src={InfoIcon} alt="info" />,
  error: <img src={ErrorIcon} alt="error" />,
  warning: <img src={WarningIcon} alt="warning" />,
}
