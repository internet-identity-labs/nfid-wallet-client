import ErrorIcon from "../icons/error.svg"
import InfoIcon from "../icons/info.svg"
import SuccessIcon from "../icons/success.svg"
import WarningIcon from "../icons/warning.svg"

export const ToastIcons: { [key: string]: JSX.Element } = {
  success: <img src={SuccessIcon} alt="success" />,
  info: <img src={InfoIcon} alt="info" />,
  error: <img src={ErrorIcon} alt="error" />,
  warning: <img src={WarningIcon} alt="warning" />,
}
