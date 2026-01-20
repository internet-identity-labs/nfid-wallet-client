import clsx from "clsx"
import { Id, toast, ToastOptions } from "react-toastify"

import { ReactComponent as ErrorIcon } from "./assets/error.svg"
import { ReactComponent as InfoIcon } from "./assets/info.svg"
import { ReactComponent as SuccessIcon } from "./assets/success.svg"
import { ReactComponent as WarningIcon } from "./assets/warning.svg"

import { CloseIcon } from "../icons/close-button"

const Toast = ({ title, text }: { title?: string; text?: string }) => {
  return (
    <div id="closeToastButton" className={clsx("text-sm text-black")}>
      <p className="font-sans font-semibold leading-5">{title}</p>
      {text ? <p className="mt-2.5 font-normal">{text}</p> : null}
    </div>
  )
}

const toaster = (
  myProps: { title?: string; text?: string },
  toastProps?: ToastOptions,
) => toast(<Toast {...myProps} />, { ...toastProps })

toaster.success = (text?: string, toastProps?: ToastOptions): Id =>
  toast.success(<Toast title="Success notification" text={text} />, {
    icon: <SuccessIcon />,
    className: text?.length ? "items-start" : "items-center",
    closeOnClick: true,
    closeButton: <CloseIcon className="h-4 mt-1 ml-auto min-w-4 max-w-4" />,
    ...toastProps,
  })

toaster.warn = (text?: string, toastProps?: ToastOptions): Id =>
  toast.warn(<Toast title="Warning notification" text={text} />, {
    icon: <WarningIcon />,
    className: text?.length ? "items-start" : "items-center",
    closeOnClick: true,
    closeButton: <CloseIcon className="h-4 mt-1 ml-auto min-w-4 max-w-4" />,
    ...toastProps,
  })

toaster.error = (text?: string, toastProps?: ToastOptions): Id =>
  toast.error(<Toast title="Error notification" text={text} />, {
    icon: <ErrorIcon />,
    className: text?.length ? "items-start" : "items-center",
    closeOnClick: true,
    closeButton: <CloseIcon className="h-4 mt-1 ml-auto min-w-4 max-w-4" />,
    ...toastProps,
  })

toaster.info = (text?: string, toastProps?: ToastOptions): Id =>
  toast.info(<Toast title="Info notification" text={text} />, {
    icon: <InfoIcon />,
    className: text?.length ? "items-start" : "items-center",
    closeOnClick: true,
    closeButton: <CloseIcon className="h-4 mt-1 ml-auto min-w-4 max-w-4" />,
    ...toastProps,
  })

export default toaster
