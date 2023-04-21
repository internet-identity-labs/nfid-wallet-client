import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"

import {
  BlurredLoader,
  Button,
  ChooseModal,
  IGroupedOptions,
  IconCmpAlertCircle,
  IconCmpInfo,
  IconCmpWarning,
  SDKApplicationMeta,
  Tooltip,
} from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

export interface IChooseAccount {
  appMeta: AuthorizingAppMeta
  accounts: IGroupedOptions[]
  onConnect: () => void
  onSelectAccount?: (value: string) => void
  onConnectionDetails?: () => void
  onConnectAnonymously?: () => void
  accountsLimitMessage?: string
}

export const ChooseAccount = ({
  accounts,
  appMeta,
  onConnect,
  onSelectAccount,
  onConnectionDetails,
  onConnectAnonymously,
  accountsLimitMessage,
}: IChooseAccount) => {
  return (
    <BlurredLoader
      className="flex flex-col flex-1 !p-0"
      isLoading={!accounts?.length}
    >
      <div className="flex justify-between mb-5">
        <div>
          <SDKApplicationMeta
            applicationLogo={appMeta.logo}
            applicationName={appMeta.name}
            title="Choose an account"
            subTitle={
              <>
                to connect to{" "}
                <a
                  className="text-blue hover:opacity-70"
                  href={`https://${appMeta.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  {appMeta.url}
                </a>
              </>
            }
          />
        </div>
        <Tooltip
          tip={
            <div>
              Connect anonymously — сreate an account <br /> for exclusive use
              with this application.
            </div>
          }
        >
          <IconCmpInfo className="cursor-pointer hover:opacity-70" />
        </Tooltip>
      </div>
      <ChooseModal
        title="Choose an account"
        label="Account"
        optionGroups={accounts}
        onSelect={onSelectAccount}
        iconClassnames="!object-contain"
      />
      <div className="rounded-md bg-gray-50 p-5 text-gray-500 text-sm mt-3.5 space-y-3">
        <p>
          Only connect to sites that you trust. By connecting, you allow{" "}
          {appMeta.url} to:
        </p>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>See your balance and activity</p>
        </div>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>Request approval for transactions</p>
        </div>
        {onConnectionDetails && (
          <p
            className="cursor-pointer text-blue hover:opacity-70"
            onClick={onConnectionDetails}
          >
            Connection details
          </p>
        )}
      </div>
      <div className="h-full" />
      <Button className="w-full mt-3" type="primary" onClick={onConnect}>
        Connect
      </Button>
      {onConnectAnonymously && (
        <TooltipProvider>
          <div
            className={clsx(
              "w-full mt-3 text-sm font-normal leading-10 h-10",
              "flex justify-center items-center space-x-1",
              accountsLimitMessage
                ? "text-secondary"
                : "text-primaryButtonColor hover:opacity-70 cursor-pointer",
            )}
            onClick={accountsLimitMessage ? undefined : onConnectAnonymously}
          >
            <span>Connect with new anonymous account</span>
            {accountsLimitMessage && (
              <Tooltip tip={accountsLimitMessage}>
                <IconCmpWarning className="text-orange" />
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )}
    </BlurredLoader>
  )
}
