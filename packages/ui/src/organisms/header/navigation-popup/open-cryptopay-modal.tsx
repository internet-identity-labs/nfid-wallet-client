import { FC, useCallback, useContext, useState } from "react"
import clsx from "clsx"
import { useDarkTheme } from "frontend/hooks"
import ScanQrInfo from "../assets/scan-qr-info.png"
import ScanQrInfoDark from "../assets/scan-qr-info-dark.png"
import { ReactComponent as ArrowLeft } from "../../../atoms/icons/arrow.svg"
import { Button } from "packages/ui/src/molecules/button"
import { Input } from "packages/ui/src/molecules/input"
import { IconCmpScanQr } from "packages/ui/src/atoms/icons"
import { ModalComponent } from "packages/ui/src/molecules/modal"
import { useQrScanner } from "./use-qr-scanner"
import { isValidQrCode } from "packages/ui/src/utils/is-valid-qr-code"
import { useActor } from "@xstate/react"
import { ProfileContext } from "frontend/provider"
import { ModalType } from "frontend/features/transfer-modal/types"

export interface OpenCryptopayModalProps {
  isOpen: boolean
  onCLose: () => void
}

const QR_SCANNER_ELEMENT_ID = "open-cryptopay-qr-scanner"

export const OpenCryptopayModal: FC<OpenCryptopayModalProps> = ({
  isOpen,
  onCLose,
}) => {
  const isDarkTheme = useDarkTheme()
  const [isInfoScreen, setIsInfoScreen] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const { transferService } = useContext(ProfileContext)
  const [, send] = useActor(transferService)
  const [incorrectLinkError, setIncorrectLinkError] = useState(false)

  const openPayScreen = useCallback(
    (value: string) => {
      setIncorrectLinkError(false)
      const str = value.trim()
      if (!isValidQrCode(str)) {
        return setIncorrectLinkError(true)
      }

      const url = new URL(str)

      const method = url.searchParams.get("method") ?? undefined
      const asset = url.searchParams.get("asset") ?? undefined
      const preselect = method && asset ? { method, asset } : undefined

      const params = url.pathname.startsWith("/v1/lnurlp/")
        ? `${url.origin}${url.pathname}`
        : url.searchParams.get("lightning")!

      onCLose()
      send({ type: "ASSIGN_VAULTS", data: false })
      send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
      send({ type: "CHANGE_DIRECTION", data: ModalType.PAY })
      send({ type: "ASSIGN_OPEN_CRYPTOPAY_PARAMS", data: params, preselect })
      send("SHOW")
    },
    [onCLose],
  )

  const { state, error, start } = useQrScanner(
    QR_SCANNER_ELEMENT_ID,
    openPayScreen,
  )

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onCLose}
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <div>
        {isInfoScreen ? (
          <>
            <div className="flex items-center gap-2">
              <ArrowLeft
                className="cursor-pointer dark:text-white"
                onClick={() => setIsInfoScreen(false)}
              />
              <div className="leading-[26px] text-[20px] font-bold dark:text-white">
                How it works
              </div>
            </div>

            <img
              src={isDarkTheme ? ScanQrInfoDark : ScanQrInfo}
              alt="QR scan"
              className="block w-full my-5"
            />
            <p className="mb-5 leading-5 dark:text-white">
              Scan an Open CryptoPay QR code to make a cryptocurrency payment
              directly from your NFID Wallet.
            </p>
            <Button
              className="w-full mb-2.5"
              onClick={() => setIsInfoScreen(false)}
            >
              Got the magic
            </Button>
          </>
        ) : (
          <>
            <div className="leading-[26px] text-[20px] font-bold dark:text-white">
              Scan QR code
            </div>
            <div
              className={clsx(
                "relative my-5 h-[400px] rounded-[12px] overflow-hidden",
                "bg-gray-50 dark:bg-zinc-900",
              )}
            >
              <div
                id={QR_SCANNER_ELEMENT_ID}
                className="!absolute h-full w-full left-0 top-0"
              />

              {state !== "scanning" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
                  {error ? (
                    <p className="text-xs leading-5 text-center text-gray-500 dark:text-zinc-400">
                      To scan QR codes, you need to allow camera access <br />
                      in your browser's site settings.
                    </p>
                  ) : (
                    <Button
                      className="w-[170px]"
                      onClick={start}
                      icon={
                        <IconCmpScanQr className="text-gray-400 !w-[18px] !h-[18px] text-white" />
                      }
                    >
                      Scan QR code
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="text"
                labelText="URL or code"
                placeholder="Paste URL or code"
                inputClassName={clsx(
                  "border-black dark:border-zinc-500 h-[56px] text-sm placeholder:text-gray-400",
                  "dark:placeholder:text-zinc-500 dark:bg-[rgba(255,255,255,0.05)]",
                  incorrectLinkError &&
                    "!border-red-600 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]",
                )}
                className="mb-6"
                value={manualInput}
                onChange={(e) => {
                  const value = e.target.value
                  setManualInput(value)
                  setIncorrectLinkError(
                    value.length > 0 && !isValidQrCode(value),
                  )
                }}
              />
              <div className="absolute left-0 top-[100%] mt-1 leading-4 text-red-600 text-xs">
                {incorrectLinkError && "Invalid URL or code"}
              </div>
            </div>
            <Button
              className="w-full mb-2.5"
              disabled={!isValidQrCode(manualInput)}
              onClick={() => openPayScreen(manualInput)}
            >
              Continue
            </Button>
            <Button
              className="w-full"
              onClick={() => setIsInfoScreen(true)}
              type="ghost"
            >
              How it works
            </Button>
          </>
        )}
      </div>
    </ModalComponent>
  )
}
