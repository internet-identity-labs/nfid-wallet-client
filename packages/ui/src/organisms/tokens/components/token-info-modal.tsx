import {
  IconNftPlaceholder,
  IconSvgExternalIcon,
} from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC } from "react"
import { FT } from "src/integration/ft/ft"

import { BTC_NATIVE_ID } from "@nfid/integration/token/constants"

export interface TokenInfoModalProps {
  token: FT | undefined
  onClose: () => void
}

export const TokenInfoModal: FC<TokenInfoModalProps> = ({ token, onClose }) => {
  const ledger = token?.getTokenAddress()
  const index = token?.getTokenIndex()

  return (
    <>
      <ModalComponent
        title="Token information"
        isVisible={Boolean(token)}
        onClose={onClose}
        className="p-[20px] w-[90%] md:w-[450px] md:!h-[580px] z-[100] rounded-xl"
      >
        <div className="mb-6 leading-6 text-[20px] font-bold">
          Token information
        </div>
        <div className="flex items-center border-b border-gray-100 h-[54px]">
          <div className="text-sm text-gray-400 w-[150px]">Token icon</div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
            <ImageWithFallback
              className="w-[40px] h-[40px] rounded-full"
              src={token?.getTokenLogo()}
              fallbackSrc={IconNftPlaceholder}
              alt={token?.getTokenSymbol()}
            />
          </div>
        </div>
        <div className="flex items-center border-b border-gray-100 h-[54px]">
          <div className="text-sm text-gray-400 w-[150px]">Token symbol</div>
          <div className="text-sm">{token?.getTokenSymbol()}</div>
        </div>
        <div className="flex items-center border-b border-gray-100 h-[54px]">
          <div className="text-sm text-gray-400 w-[150px]">Token name</div>
          <div className="text-sm">{token?.getTokenName()}</div>
        </div>
        {ledger && ledger !== BTC_NATIVE_ID && (
          <div className="flex items-center border-b border-gray-100 h-[54px]">
            <div className="text-sm text-gray-400 w-[150px]">
              Ledger canister ID
            </div>
            <div className="text-sm">
              <CopyAddress
                address={ledger}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <a
              target="_blank"
              href={token?.getBlockExplorerLink()}
              className="ml-auto"
            >
              <img width={24} src={IconSvgExternalIcon} />
            </a>
          </div>
        )}
        {index && (
          <div className="flex items-center border-b border-gray-100 h-[54px]">
            <div className="text-sm text-gray-400 w-[150px]">
              Index canister ID
            </div>
            <div className="text-sm">
              <CopyAddress address={index} leadingChars={6} trailingChars={4} />
            </div>
            <a
              target="_blank"
              href={token?.getIndexBlockExplorerLink()}
              className="ml-auto"
            >
              <img width={24} src={IconSvgExternalIcon} />
            </a>
          </div>
        )}
        {ledger !== BTC_NATIVE_ID ? (
          <div className="flex items-center border-b border-gray-100 h-[54px]">
            <div className="text-sm text-gray-400 w-[150px]">
              Transaction fee
            </div>
            <div>
              <div className="text-sm">{token?.getTokenFeeFormatted()}</div>
              <div className="text-xs text-gray-400">
                {token?.getTokenFeeFormattedUsd()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center border-b border-gray-100 h-[54px]">
            <div className="text-sm text-gray-400 w-[150px]">Network</div>
            <div className="text-sm">Bitcoin</div>
          </div>
        )}
      </ModalComponent>
    </>
  )
}
