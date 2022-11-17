import clsx from "clsx"

import loadingIcon from "./assets/loading.svg"
import successGreenIcon from "./assets/success-green.svg"

import logo from "../../assets/id.svg"

export interface SDKStatusbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  isSuccess: boolean
}

export const SDKStatusbar = ({
  isLoading,
  isSuccess,
  children,
}: SDKStatusbarProps) => {
  return (
    <div className={clsx("flex space-x-2.5 items-center mb-2.5")}>
      <div
        className={clsx(
          "w-10 h-10 rounded-full bg-gray-50",
          "flex justify-center items-center",
          "relative",
        )}
      >
        <img className="w-6" src={logo} alt="provider" />
        <div className={clsx("absolute -bottom-1 -right-1")}>
          <img
            className={clsx("animate-spin", !isLoading && "hidden")}
            src={loadingIcon}
            alt="loading"
          />
          <img
            className={clsx(!isSuccess && "hidden")}
            src={successGreenIcon}
            alt="success"
          />
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}
