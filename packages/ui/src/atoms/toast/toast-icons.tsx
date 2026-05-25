import ErrorIcon from "./assets/error.svg?url"
import InfoIcon from "./assets/info.svg?url"
import SuccessIcon from "./assets/success.svg?url"
import WarningIcon from "./assets/warning.svg?url"

export const ToastIcons: { [key: string]: JSX.Element } = {
  success: <img src={SuccessIcon} alt="success" />,
  info: <img src={InfoIcon} alt="info" />,
  error: <img src={ErrorIcon} alt="error" />,
  warning: <img src={WarningIcon} alt="warning" />,
}
