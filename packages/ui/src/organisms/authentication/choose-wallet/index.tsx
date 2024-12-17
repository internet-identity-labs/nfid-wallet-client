import clsx from "clsx"
import { FC } from "react"

import { BlurredLoader, Button, CenterEllipsis } from "@nfid-frontend/ui"
import { ExistingWallet } from "@nfid/integration"

import { AuthAppMeta } from "../app-meta"
import Caret from "./caret.svg"

interface AuthorizationRequest {
  hostname?: string
}

interface AuthorizingAppMeta {
  name?: string
}

export interface ChooseWalletProps {
  onAuthSelection: () => void
  onLoginWithPasskey: (allowedPasskeys: any[]) => Promise<void>
  isLoading: boolean
  showLogo?: boolean
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
  wallets?: ExistingWallet[]
}

export const ChooseWallet: FC<ChooseWalletProps> = ({
  onAuthSelection,
  onLoginWithPasskey,
  isLoading,
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
    <BlurredLoader isLoading={isLoading} overlayClassnames="rounded-[24px]">
      <div className="flex flex-col w-full h-full text-sm text-center">
        <AuthAppMeta
          applicationURL={appHost}
          withLogo={!showLogo}
          title={"Choose Wallet"}
          subTitle={<>to continue to</>}
        />
        <div className="mt-10 text-left">
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
                <div className="relative">
                  <div
                    className={clsx(
                      "absolute w-0 h-0.5 bg-black top-0 bottom-0 right-[1px] my-auto",
                      "group-hover:w-3 transition-all duration-300",
                    )}
                  ></div>
                  <img
                    className="transition-transform group-hover:translate-x-[2px] duration-300"
                    src={Caret}
                    alt="email-verification-error"
                  />
                </div>
              </div>
            )
          })}
        </div>
        <Button className="mt-4" block onClick={onAuthSelection} type="ghost">
          Use a different wallet
        </Button>
      </div>
    </BlurredLoader>
  )
}
