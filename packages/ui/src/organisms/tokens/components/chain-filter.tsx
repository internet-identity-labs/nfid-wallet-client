import clsx from "clsx"
import { FC } from "react"
import {
  FilterPopover,
  IconCmpFilters,
  DropdownSelect,
} from "@nfid-frontend/ui"

import { AllNetworksIcon } from "packages/ui/src/atoms/icons/AllNetworksIcon"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { BtcNetworkIcon } from "packages/ui/src/atoms/icons/BtcNetworkIcon"
import { EthNetworkIcon } from "packages/ui/src/atoms/icons/EthNetworkIcon"
import { IcpNetworkIcon } from "packages/ui/src/atoms/icons/IcpNetworkIcon"
import { PolNetworkIcon } from "packages/ui/src/atoms/icons/PolNetworkIcon"
import { BnbNetworkIcon } from "packages/ui/src/atoms/icons/BnbNetworkIcon"
import { BaseNetworkIcon } from "packages/ui/src/atoms/icons/BaseNetworkIcon"
import { ArbNetworkIcon } from "packages/ui/src/atoms/icons/ArbNetworkIcon"

const chainOptions = [
  { label: "Bitcoin", value: `${ChainId.BTC}`, icon: BtcNetworkIcon },
  { label: "Ethereum", value: `${ChainId.ETH}`, icon: EthNetworkIcon },
  { label: "Internet Computer", value: `${ChainId.ICP}`, icon: IcpNetworkIcon },
  { label: "Polygon", value: `${ChainId.POL}`, icon: PolNetworkIcon },
  { label: "BNB Chain", value: `${ChainId.BNB}`, icon: BnbNetworkIcon },
  { label: "Base", value: `${ChainId.BASE}`, icon: BaseNetworkIcon },
  { label: "Arbitrum", value: `${ChainId.ARB}`, icon: ArbNetworkIcon },
]

export interface ICRC1Metadata {
  name: string
  symbol: string
  logo?: string
  decimals: number
  fee: bigint
}

interface ChainFilterProps {
  filter: string[]
  setFilter: (chains: string[]) => void
}

export const ChainFilter: FC<ChainFilterProps> = ({ filter, setFilter }) => (
  <FilterPopover
    title="Assets"
    align="end"
    className="!min-w-[384px]"
    trigger={
      <div id={"filter-chains"} className="flex items-center justify-end">
        <div className="relative">
          <IconCmpFilters className="w-[21px] h-[21px] transition-opacity cursor-pointer hover:opacity-60 dark:text-white bg-transparent" />
          <div
            className={clsx(
              "absolute w-2.5 h-2.5 bg-teal-600 dark:bg-teal-500 right-0 bottom-0 rounded-full border-2 border-white dark:border-[#141518]",
              filter.length > 0 ? "block" : "hidden",
            )}
          ></div>
        </div>
      </div>
    }
    onReset={() => setFilter([])}
  >
    <DropdownSelect
      options={chainOptions}
      selectedValues={filter}
      setSelectedValues={setFilter}
      placeholder="All networks"
      placeholderIcon={AllNetworksIcon}
    />
  </FilterPopover>
)
