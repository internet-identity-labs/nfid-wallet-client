import { useCallback, useMemo } from "react"

import { IGroupedOptions } from "@nfid-frontend/ui"
import {
  BlurredLoader,
  Button,
  ChooseModal,
  IconCmpAlertCircle,
  IconCmpInfo,
  SDKApplicationMeta,
  Tooltip,
} from "@nfid-frontend/ui"
import { E8S } from "@nfid/integration/token/icp"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"
import { useEthBalance } from "frontend/features/fungable-token/eth/hooks/use-eth-balances"

interface IChooseAccount {
  applicationLogo?: string
  applicationName?: string
  applicationURL?: string
  onConnectionDetails: () => void
  onConnect: (hostname: string, accountId: string) => void
}

export const ChooseAccount = ({
  applicationLogo,
  applicationName,
  applicationURL,
  onConnectionDetails,
  onConnect,
}: IChooseAccount) => {
  const { address } = useEthAddress()
  const { balance } = useEthBalance()

  const accountsOptions: IGroupedOptions[] = useMemo(() => {
    if (!address) return []

    return [
      {
        label: "Public",
        options: [
          {
            title: "NFID Account 1",
            value: address,
            subTitle: address,
            innerTitle: balance?.tokenBalance
              ? `${Number(balance.tokenBalance) / E8S} ETH`
              : "",
            innerSubtitle: balance?.usdBalance,
          },
        ],
      },
    ]
  }, [address, balance?.tokenBalance, balance?.usdBalance])

  const handleConnect = useCallback(() => {
    return onConnect("nfid.one", "0")
  }, [onConnect])

  return (
    <BlurredLoader className="!p-0" isLoading={!accountsOptions?.length}>
      <div className="flex justify-between">
        <div>
          <SDKApplicationMeta
            applicationLogo={applicationLogo}
            applicationName={applicationName}
            title="Choose an account"
            subTitle={
              <>
                to connect to{" "}
                <a
                  className="text-blue hover:opacity-70"
                  href={`https://${applicationURL}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  {applicationURL}
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
        optionGroups={accountsOptions}
        preselectedValue={address ?? ""}
      />
      <div className="rounded-md bg-gray-50 p-5 text-gray-500 text-sm mt-3.5 space-y-3">
        <p>
          Only connect to sites that you trust. By connecting, you allow
          {applicationURL} to:
        </p>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>See your balance and activity</p>
        </div>
        <div className="flex items-center space-x-1">
          <IconCmpAlertCircle className="text-checkMarkColor" />
          <p>Request approval for transactions</p>
        </div>
        <p
          className="cursor-pointer text-blue hover:opacity-70"
          onClick={onConnectionDetails}
        >
          Connection details
        </p>
      </div>
      <Button className="w-full mt-3" onClick={handleConnect}>
        Connect
      </Button>
    </BlurredLoader>
  )
}
