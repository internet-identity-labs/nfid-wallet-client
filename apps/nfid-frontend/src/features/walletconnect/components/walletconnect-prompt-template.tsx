import clsx from "clsx"
import { PropsWithChildren } from "react"

import { Button } from "@nfid-frontend/ui"
import { Spinner } from "packages/ui/src/atoms/spinner"

export interface WalletConnectPromptTemplateProps
  extends PropsWithChildren<{}> {
  primaryButtonText?: string
  onPrimaryButtonClick?: () => void
  secondaryButtonText?: string
  onSecondaryButtonClick?: () => void
  title?: string | JSX.Element
  subTitle: string | JSX.Element
  isPrimaryDisabled?: boolean
  isPrimaryLoading?: boolean
  className?: string
}

export const WalletConnectPromptTemplate = ({
  primaryButtonText = "Approve",
  secondaryButtonText = "Reject",
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  title,
  subTitle,
  children,
  isPrimaryDisabled,
  isPrimaryLoading = false,
  className,
}: WalletConnectPromptTemplateProps) => {
  return (
    <div className={clsx("flex flex-col flex-1 h-full", className)}>
      <div className="flex flex-col items-center mt-10 mb-10 text-sm text-center">
        {title && (
          <div className="block w-full text-[20px] lg:text-[28px] font-bold mb-2 lg:mb-4 dark:text-white">
            {title}
          </div>
        )}
        <div className="block w-full text-sm">{subTitle}</div>
      </div>
      {children}
      <div className={clsx("flex items-center gap-5 mt-5")}>
        {onSecondaryButtonClick && (
          <Button
            block
            type="stroke"
            onClick={onSecondaryButtonClick}
            disabled={isPrimaryDisabled || isPrimaryLoading}
          >
            {secondaryButtonText}
          </Button>
        )}
        {onPrimaryButtonClick && (
          <Button
            block
            type="primary"
            disabled={isPrimaryDisabled || isPrimaryLoading}
            onClick={onPrimaryButtonClick}
            icon={
              isPrimaryLoading ? (
                <Spinner className="w-5 h-5 text-white" />
              ) : undefined
            }
          >
            {primaryButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
