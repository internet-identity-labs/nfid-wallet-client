import clsx from "clsx"
import React from "react"

import successWhiteIcon from "./assets/success-white.svg"

import { Button } from "../../atoms/button"
import { NFIDGradientBar } from "../../atoms/gradient-bar"
import { SDKFooter } from "../../atoms/sdk-footer/footer"
import { SDKHeader } from "../../atoms/sdk-header"
import { SDKApplicationMeta } from "../../molecules/sdk-app-meta"

export interface ApproveTemplateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  applicationName: string
  applicationLogo: string
  onReject: () => void
  onApprove: () => void
  successTimer?: number
  isLoading?: boolean
}

export const ApproveTemplate: React.FC<ApproveTemplateProps> = ({
  children,
  className,
  applicationName,
  applicationLogo,
  onReject,
  onApprove,
  successTimer = -1,
  isLoading = false,
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
          "w-full h-full flex-grow p-5",
          "sm:border-x sm:border-b sm:border-gray-100",
          "flex flex-col justify-between",
          className,
        )}
      >
        <SDKApplicationMeta
          applicationLogo={applicationLogo}
          title={applicationName}
          subTitle="wants to perform the following actions:"
        />

        <div
          className={clsx(
            "border border-gray-300 rounded-md",
            "flex-grow h-full",
            "p-3 mt-4 mb-16",
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
            "flex items-center justify-center",
            successTimer === -1 && "hidden",
          )}
          block
          primary
        >
          <img
            src={successWhiteIcon}
            alt="success-icon"
            className={clsx("mr-2")}
          />
          Success! Closing in {successTimer}
        </Button>
      </div>

      <SDKFooter />
    </div>
  )
}
