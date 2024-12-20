import ErrorIcon from "./assets/error.svg"
import InfoIcon from "./assets/info.svg"
import SuccessIcon from "./assets/success.svg"
import WarningIcon from "./assets/warning.svg"

export const ToastIcons: { [key: string]: JSX.Element } = {
  success: <img src={SuccessIcon} alt="success" />,
  info: <img src={InfoIcon} alt="info" />,
  error: <img src={ErrorIcon} alt="error" />,
  warning: <img src={WarningIcon} alt="warning" />,
}
