import clsx from "clsx"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { FC } from "react"

import { Button, CenterEllipsis } from "@nfid-frontend/ui"
import { ExistingWallet } from "@nfid/integration"

import { AuthAppMeta } from "../app-meta"

interface AuthorizationRequest {
  hostname?: string
}

interface AuthorizingAppMeta {
  name?: string
}

export interface ChooseWalletProps {
  onAuthSelection: () => void
  onLoginWithPasskey: (allowedPasskeys: any[]) => Promise<void>
  showLogo?: boolean
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
  wallets?: ExistingWallet[]
}

export const ChooseWallet: FC<ChooseWalletProps> = ({
  onAuthSelection,
  onLoginWithPasskey,
  showLogo,
  authRequest,
  appMeta,
  wallets,
}) => {
  let appHost: string = ""
  try {
    appHost = new URL(authRequest?.hostname ?? "").host
  } catch (e) {
    appHost = appMeta?.name ?? ""
  }

  if (!wallets) return null
  return (
    <>
      <div className="flex flex-col w-full h-full text-sm text-center">
        <AuthAppMeta
          applicationURL={appHost}
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
                className={clsx(
                  "flex items-center h-[64px] gap-1 justify-between cursor-pointer",
                  "border-b border-gray-100 last:border-b-0 px-[14px] rounded-[12px]",
                  "hover:bg-gray-50 transition-all group",
                )}
                onClick={() => onLoginWithPasskey(wallet.allowedPasskeys)}
              >
                <div>
                  <p>{wallet.email}</p>
                  <p className="mt-0.5 tex-xs text-gray-400 leading-4.5">
                    <CenterEllipsis
                      value={wallet.principal}
                      leadingChars={6}
                      trailingChars={3}
                    />
                  </p>
                </div>
                <IconCaret />
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
