import clsx from "clsx"
import { ModalComponent, Toggle } from "@nfid-frontend/ui"
import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import { useDarkTheme } from "frontend/hooks"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export function PortfolioOptions({
  hideZeroBalance,
  onZeroBalanceToggle,
  testnetEnabled,
  onTestnetToggle,
  arbitrumEnabled,
  onArbitrumToggle,
  baseEnabled,
  onBaseToggle,
  polygonEnabled,
  onPolygonToggle,
  isOpen,
  setIsOpen,
}: {
  hideZeroBalance: boolean
  onZeroBalanceToggle: () => void
  testnetEnabled: boolean
  onTestnetToggle: () => void
  arbitrumEnabled: boolean
  onArbitrumToggle: () => void
  baseEnabled: boolean
  onBaseToggle: () => void
  polygonEnabled: boolean
  onPolygonToggle: () => void
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}) {
  const isDarkTheme = useDarkTheme()

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={() => {
        setIsOpen(false)
      }}
      className="p-5 w-[95%] md:w-[450px] z-[100] !rounded-[24px]"
    >
      <div className={clsx("flex flex-col dark:text-white")}>
        <p className="text-[20px] leading-[24px] font-bold dark:text-white mb-[18px]">
          Portfolio options
        </p>
        <div className="mb-[20px] bg-gray-50 dark:bg-zinc-800 py-1 px-2.5 rounded-[12px]">
          <div className="h-[40px] flex items-center justify-between">
            <span className="dark:text-white">Hide zero balances</span>
            <Toggle
              isChecked={hideZeroBalance}
              onToggle={onZeroBalanceToggle}
            />
          </div>
          <div className="h-[40px] flex items-center justify-between">
            <span className="dark:text-white">Hide testnets</span>
            <Toggle isChecked={!testnetEnabled} onToggle={onTestnetToggle} />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-800 py-1 px-2.5 rounded-[12px]">
          <div className="h-[40px] flex items-center gap-2">
            <div className="w-[24px] h-[24px] bg-white dark:bg-zinc-900 rounded-[8px]">
              {getNetworkIcon(ChainId.ARB, isDarkTheme, 24)}
            </div>
            <span className="dark:text-white">Arbitrum</span>
            <div className="ml-auto">
              <Toggle isChecked={arbitrumEnabled} onToggle={onArbitrumToggle} />
            </div>
          </div>
          <div className="h-[40px] flex items-center gap-2">
            <div className="w-[24px] h-[24px] bg-white dark:bg-zinc-900 rounded-[8px]">
              {getNetworkIcon(ChainId.BASE, isDarkTheme, 24)}
            </div>
            <span className="dark:text-white">Base</span>
            <div className="ml-auto">
              <Toggle isChecked={baseEnabled} onToggle={onBaseToggle} />
            </div>
          </div>
          <div className="h-[40px] flex items-center gap-2">
            <div className="w-[24px] h-[24px] bg-white dark:bg-zinc-900 rounded-[8px]">
              {getNetworkIcon(ChainId.POL, isDarkTheme, 24)}
            </div>
            <span className="dark:text-white">Polygon</span>
            <div className="ml-auto">
              <Toggle isChecked={polygonEnabled} onToggle={onPolygonToggle} />
            </div>
          </div>
        </div>
      </div>
    </ModalComponent>
  )
}
