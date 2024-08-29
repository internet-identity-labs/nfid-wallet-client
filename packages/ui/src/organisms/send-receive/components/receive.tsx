import clsx from "clsx"
import { FC } from "react"

import {
  ChooseModal,
  Copy,
  QRCode,
  BlurredLoader,
  CenterEllipsis,
} from "@nfid-frontend/ui"

export interface ReceiveProps {
  isVault: boolean
  isAccountsValidating: boolean
  selectedAccountAddress: string
  address: string
  accountsOptions: {
    label: string
    options: {
      title: string
      subTitle?: string
      innerTitle?: string
      innerSubtitle?: string
      icon?: string
      value: string
      badgeText?: string
    }[]
  }[]
  setSelectedAccountAddress: (value: React.SetStateAction<string>) => void
}

export const Receive: FC<ReceiveProps> = ({
  isVault,
  isAccountsValidating,
  selectedAccountAddress,
  setSelectedAccountAddress,
  address,
  accountsOptions,
}) => {
  return (
    <BlurredLoader
      className="mt-[5px] text-xs"
      isLoading={!accountsOptions.length || isAccountsValidating}
    >
      <p className="text-sm mb-[20px]">
        NFID Wallet currently supports Internet Computer Protocol tokens and
        standards: ICP, ICRC-1, EXT NFTs, and additional support coming soon.
      </p>
      {isVault && (
        <ChooseModal
          label="Accounts"
          title={"Choose an account"}
          optionGroups={accountsOptions}
          iconClassnames="!w-6 !h-auto !object-contain"
          preselectedValue={selectedAccountAddress}
          onSelect={setSelectedAccountAddress}
          type="small"
          isSmooth
        />
      )}

      {!isVault && (
        <div>
          <p className="mb-1 text-gray-400">Wallet address</p>
          <div className="rounded-[12px] bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
            <CenterEllipsis
              value={selectedAccountAddress ?? ""}
              leadingChars={29}
              trailingChars={5}
              id={"principal"}
            />
            <Copy value={selectedAccountAddress} />
          </div>
        </div>
      )}
      <div>
        <p className="mt-[10px] mb-1 text-gray-400">
          Account ID (for deposits from exchanges)
        </p>
        <div className="rounded-[12px] bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
          <CenterEllipsis
            value={address ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"address"}
          />
          <Copy value={address} />
        </div>
      </div>
      <div className="pt-[52px] mx-auto">
        <QRCode options={{ width: 150, margin: 0 }} content={address} />
      </div>

      <div
        className={clsx(
          "absolute top-0 left-0 z-50 w-full h-full p-5 bg-white transition-all duration-200 ease-in-out",
          "-translate-x-full",
        )}
      ></div>
    </BlurredLoader>
  )
}
