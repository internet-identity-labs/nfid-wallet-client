import clsx from "clsx"
import React from "react"

import successWhiteIcon from "./assets/success-white.svg"

import { Button } from "@nfid/ui/molecules/button"
import { SDKApplicationMeta } from "@nfid/ui/molecules/sdk-app-meta"
import { ScreenResponsive } from "../screen-responsive"

export interface ApproveTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  applicationName: string
  applicationLogo: string
  onReject: () => void
  onApprove: () => void
  successTimer?: number
  isLoading?: boolean
}

export const ApproveTemplate: React.FC<ApproveTemplateProps> = ({
  children,
  className: _className,
  applicationName,
  applicationLogo,
  onReject,
  onApprove,
  successTimer = -1,
  isLoading = false,
}) => {
  return (
    <ScreenResponsive>
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
        <Button
          disabled={isLoading}
          type="stroke"
          onClick={onReject}
          className="flex items-center justify-center"
        >
          Reject
        </Button>
        <Button
          disabled={isLoading}
          onClick={onApprove}
          className="flex items-center justify-center"
        >
          Approve
        </Button>
      </div>
      <Button
        icon={
          <img
            src={successWhiteIcon}
            alt="success-icon"
            className={clsx("mr-2")}
          />
        }
        className={clsx(
          "flex items-center justify-center",
          successTimer === -1 && "hidden",
        )}
      >
        Success! Closing in {successTimer}
      </Button>
    </ScreenResponsive>
  )
}
