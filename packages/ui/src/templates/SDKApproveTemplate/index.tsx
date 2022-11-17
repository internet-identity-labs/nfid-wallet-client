import clsx from "clsx"
import React from "react"

import successWhiteIcon from "./assets/success-white.svg"

import logo from "../../assets/id.svg"
import { Button } from "../../atoms/button"
import { NFIDGradientBar } from "../../atoms/gradient-bar"
import { SDKFooter } from "../../atoms/sdk-footer/footer"
import { SDKHeader } from "../../atoms/sdk-header"
import { SDKStatusbar } from "../../atoms/sdk-statusbar"
import { SDKMeta } from "../../molecules/sdk-meta"

export interface SDKApproveTemplateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  applicationName: string
  provider?: "nfid" | "dfinity"
  onReject: () => void
  onApprove: () => void
  successTimer?: number
  isLoading?: boolean
}

export const SDKApproveTemplate: React.FC<SDKApproveTemplateProps> = ({
  children,
  className,
  applicationName,
  onReject,
  onApprove,
  successTimer = -1,
  isLoading = false,
  provider = "nfid",
}) => {
  return (
    <div
      className={clsx(
        "relative flex flex-col justify-between h-screen font-inter",
        "sm:min-h-[550px] sm:w-[450px] sm:absolute sm:h-auto",
        "sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2",
      )}
    >
      <NFIDGradientBar className="w-full h-0.5 z-20" rounded={false} />
      <SDKHeader frameLabel="Approve with NFID" />

      <div
        className={clsx(
          "w-full h-full flex-grow p-[22px]",
          "sm:border-x sm:border-b sm:border-gray-100",
          "flex flex-col justify-between",
          className,
        )}
      >
        <SDKMeta
          applicationLogo={logo}
          title={applicationName}
          subTitle="wants to perform the following actions:"
        />

        <div
          className={clsx(
            "border border-gray-300 rounded-md",
            "flex-grow h-full",
            "p-3 mt-4 mb-14",
          )}
        >
          {children}
        </div>

        <div
          className={clsx(
            "w-full grid grid-cols-2 gap-5",
            successTimer !== -1 && "hidden",
          )}
        >
          <Button disabled={isLoading} stroke onClick={onReject}>
            Reject
          </Button>
          <Button disabled={isLoading} primary onClick={onApprove}>
            Approve
          </Button>
        </div>
        <Button
          className={clsx(
            "mt-5 lg:mt-32 flex items-center justify-center",
            successTimer === -1 && "hidden",
          )}
          block
          primary
        >
          <img src={successWhiteIcon} alt="success-icon" className="mr-1.5" />
          Success! Closing in {successTimer}
        </Button>
      </div>

      <SDKFooter />
    </div>
  )
}
