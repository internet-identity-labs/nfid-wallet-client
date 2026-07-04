import clsx from "clsx"
import { FC, memo, useState } from "react"

import {
  ImageWithFallback,
  IconCmpExternalIcon,
  CopyAddress,
} from "@nfid-frontend/ui"

import { A } from "../../atoms/custom-link"
import ProfileContainer from "../../atoms/profile-container/Container"
import { ModalComponent } from "@nfid-frontend/ui"
import { DiscoveryAppData } from "@nfid/integration/token/icrc1/types"
import DiscoveryPlaceholder from "../discovery/assets/discovery-placeholder.jpg"
import DiscoveryDarkPlaceholder from "../discovery/assets/discovery-placeholder-dark.jpg"
import { Tokens } from "../tokens"
import { FT } from "frontend/integration/ft/ft"
import { useDarkTheme } from "frontend/hooks"

export interface PrivateAccounDetailstProps {
  dappInfo: {
    app: DiscoveryAppData
    account: string
  }
  tokens?: FT[]
  isTokensLoading: boolean
}

export const PrivateAccountDetails: FC<PrivateAccounDetailstProps> = memo(
  ({ dappInfo, tokens, isTokensLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isDarkTheme = useDarkTheme()

    return (
      <>
        <ProfileContainer
          className="!px-0 !pt-[20px] md:!px-[30px] sm:!pt-[20px] !pb-[7px] flex-[100%] dark:text-white mb-[30px]"
          innerClassName="!p-0"
          titleClassName="!p-0 mb-[20px]"
        >
          <ModalComponent
            isVisible={isModalOpen}
            className="!bg-transparent"
            onClose={() => setIsModalOpen(false)}
          >
            <div
              className="w-[95vw] h-[95vh] flex justify-center items-center"
              onClick={(e) => {
                if ((e.target as HTMLElement).id === "full-image") return
                setIsModalOpen(false)
              }}
            >
              <img
                id="full-image"
                src={dappInfo.app.image}
                alt={dappInfo.app.name}
                className="rounded-[24px] max-h-full max-w-full"
              />
            </div>
          </ModalComponent>
          <div
            className={clsx(
              "grid gap-[30px] max-w-[100vw] mb-[20px] sm:mb-[30px]",
              "grid-cols-1 lg:grid-cols-[auto,1fr]",
            )}
          >
            <div
              onClick={() => {
                setIsModalOpen(true)
              }}
              className={clsx(
                "relative overflow-hidden bg-gray-50 dark:bg-zinc-700 rounded-[11px] aspect-[445/232] cursor-pointer",
                "lg:max-w-[445px] flex items-center justify-center",
              )}
            >
              <ImageWithFallback
                src={dappInfo.app.image}
                fallbackSrc={
                  isDarkTheme ? DiscoveryDarkPlaceholder : DiscoveryPlaceholder
                }
                alt={dappInfo.app.name}
                className="w-full"
              />
            </div>
            <div
              className="flex flex-col"
              id={`dapp_${dappInfo.app.id}_${dappInfo.app.name}`}
            >
              <div
                className={clsx(
                  "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                  "block sm:flex items-center dark:text-white sm:py-5",
                )}
              >
                <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                  Your wallet address
                </p>
                <CopyAddress
                  className="text-sm dark:text-white"
                  address={dappInfo.account}
                  leadingChars={6}
                  trailingChars={4}
                />
              </div>
              {dappInfo.app.desc && (
                <div
                  className={clsx(
                    "min-h-[64px] sm:min-h-[54px] sm:border-b border-gray-100 dark:border-zinc-500",
                    "block sm:flex items-center dark:text-white sm:py-5",
                  )}
                >
                  <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                    Description
                  </p>
                  <p className="text-sm">{dappInfo.app.desc}</p>
                </div>
              )}
              <div
                className={clsx(
                  "min-h-[64px] sm:min-h-[54px]",
                  "block sm:flex items-center dark:text-white sm:py-5",
                )}
              >
                <p className="text-sm text-gray-400 dark:text-zinc-500 flex-shrink-0 flex-grow-0 basis-[160px]">
                  Link
                </p>
                <A
                  href={dappInfo.app.url}
                  className="leading-5 break-all"
                  target="_blank"
                >
                  {dappInfo.app.url}
                  <IconCmpExternalIcon className="inline-block ml-[7px] mt-0.5" />
                </A>
              </div>
            </div>
          </div>
        </ProfileContainer>
        <ProfileContainer>
          <Tokens
            initedTokens={tokens || []}
            isTokensLoading={isTokensLoading}
            isPrivateAccount={true}
          />
        </ProfileContainer>
      </>
    )
  },
)
