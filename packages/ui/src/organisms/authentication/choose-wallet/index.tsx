import clsx from "clsx"
import { IconCaret } from "@nfid/ui/atoms/icons/caret"
import { FC } from "react"

import { Button, CenterEllipsis } from "@nfid/ui"
import { ExistingWallet } from "@nfid/integration"

import { useDarkTheme } from "frontend/hooks"

import { AuthAppMeta } from "../app-meta"

export interface ChooseWalletProps {
  onAuthSelection: () => void
  onLoginWithPasskey: (allowedPasskeys: any[]) => Promise<void>
  showLogo?: boolean
  applicationURL?: string
  wallets?: ExistingWallet[]
}

export const ChooseWallet: FC<ChooseWalletProps> = ({
  onAuthSelection,
  onLoginWithPasskey,
  showLogo,
  applicationURL,
  wallets,
}) => {
  const isDarkTheme = useDarkTheme()
  if (!wallets) return null
  return (
    <>
      <div className="flex flex-col w-full h-full text-sm text-center">
        <AuthAppMeta
          applicationURL={applicationURL}
          withLogo={!showLogo}
          title={"Choose Wallet"}
          subTitle={<>to continue to</>}
        />
        <div
          className={clsx(
            "mt-10 text-left max-h-[286px] overflow-auto",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
          )}
        >
          {wallets.map((wallet, i) => {
            return (
              <div
                key={wallet.principal + i}
                className="border-b border-gray-100 dark:border-zinc-700 last:border-b-0"
              >
                <div
                  className={clsx(
                    "flex items-center h-[64px] gap-1 justify-between cursor-pointer",
                    "px-[14px] rounded-[12px]",
                    "hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all group",
                  )}
                  onClick={() => onLoginWithPasskey(wallet.allowedPasskeys)}
                >
                  <div>
                    <p className="dark:text-white">
                      {wallet.email ?? wallet.name}
                    </p>
                    <p className="mt-0.5 tex-xs text-gray-400 dark:text-zinc-500 leading-4.5">
                      <CenterEllipsis
                        value={wallet.principal}
                        leadingChars={6}
                        trailingChars={3}
                      />
                    </p>
                  </div>
                  <IconCaret color={isDarkTheme ? "white" : "black"} />
                </div>
              </div>
            )
          })}
        </div>
        <Button className="mt-4" block onClick={onAuthSelection} type="ghost">
          Use a different wallet
        </Button>
      </div>
    </>
  )
}
