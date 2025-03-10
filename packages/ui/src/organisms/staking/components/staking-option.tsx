import clsx from "clsx"
import { A } from "packages/ui/src/atoms/custom-link"
import { IconInfo, IconNftPlaceholder } from "packages/ui/src/atoms/icons"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { TableStakingOptionSkeleton } from "packages/ui/src/atoms/skeleton/table-staking-option"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { Table } from "packages/ui/src/molecules/table"
import { Tooltip } from "packages/ui/src/molecules/tooltip"
import { FC } from "react"

import DiamondIcon from "../assets/diamond.svg"

export enum StakingOptions {
  Available = "Available",
  Unlocking = "Unlocking",
  Locked = "Locked",
}

export interface StakingOptionProps {
  stakingOption: StakingOptions
  isLoading: boolean
}

export const StakingOption: FC<StakingOptionProps> = ({
  stakingOption,
  isLoading,
}) => {
  return (
    <ProfileContainer
      title={stakingOption}
      className="!py-[20px] md:!py-[30px] !mb-[20px] md:!mb-[30px]"
      titleClassName="!px-0 md:!px-[30px] mb-[10px] md:!mb-[30px]"
      innerClassName="!px-0"
    >
      <Table className="!min-w-0 table-fixed w-full" id="staking-table">
        {isLoading ? (
          <TableStakingOptionSkeleton tableRowsAmount={3} tableCellAmount={4} />
        ) : (
          <>
            <tr id={`stake_1`} className="hidden md:table-row">
              <td
                className={clsx(
                  "pb-[10px] text-sm font-bold text-gray-400",
                  "px-0 md:px-[30px]",
                  "w-[35%]",
                )}
              >
                <div className="flex items-center gap-1">
                  Stake ID
                  <Tooltip
                    align="end"
                    alignOffset={-20}
                    tip={
                      <span className="block max-w-[300px]">
                        Stake IDs are synonymous to “neuron IDs” in other
                        systems like the NNS.
                      </span>
                    }
                  >
                    <img
                      src={IconInfo}
                      alt="icon"
                      className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                    />
                  </Tooltip>
                </div>
              </td>
              <td
                className={clsx(
                  "pb-[10px] text-sm font-bold text-gray-400",
                  "w-[15%]",
                )}
              >
                Initial stake
              </td>
              <td
                className={clsx(
                  "pb-[10px] text-sm font-bold text-gray-400",
                  "px-0 md:px-[10px] w-[15%]",
                )}
              >
                <div className="flex items-center gap-1">
                  Rewards
                  <Tooltip
                    align="end"
                    alignOffset={-20}
                    tip={
                      <>
                        <span className="block max-w-[300px] mb-4">
                          Rewards are earned in “maturity”, which will convert
                          to ICP at the time of stake withdrawal.
                        </span>
                        <A
                          target="_blank"
                          href="https://internetcomputer.org/docs/building-apps/governing-apps/nns/concepts/neurons/staking-voting-rewards"
                        >
                          Read More
                        </A>
                      </>
                    }
                  >
                    <img
                      src={IconInfo}
                      alt="icon"
                      className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                    />
                  </Tooltip>
                </div>
              </td>
              <td
                className={clsx(
                  "pb-[10px] text-sm font-bold text-gray-400",
                  "px-0 md:px-[10px] w-[15%]",
                )}
              >
                Lock time
              </td>
              <td
                className={clsx(
                  "pb-[10px] text-sm font-bold text-gray-400",
                  "px-0 md:px-[10px] w-[15%]",
                )}
              >
                <span
                  className={clsx(
                    stakingOption !== StakingOptions.Unlocking && "invisible",
                  )}
                >
                  Unlock in
                </span>
              </td>
              <td className={clsx("w-[55px]")} />
            </tr>
            <tr className="text-sm md:hover:bg-gray-50 h-[64px]">
              <td className="md:pl-[30px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[40px] h-[40px] rounded-full bg-zinc-50 relative">
                    <ImageWithFallback
                      alt="ICP"
                      fallbackSrc={IconNftPlaceholder}
                      src="#"
                      className={clsx(
                        "w-full h-full",
                        "rounded-full object-cover min-w-[24px] md:min-w-[40px]",
                      )}
                    />
                    <div
                      className={clsx(
                        "absolute bottom-0 right-0 rounded-full",
                        "flex items-center justify-center w-5 h-5 bg-white",
                      )}
                    >
                      <img src={DiamondIcon} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm leading-[20px]">
                      <CopyAddress address="5695121862339497860" />
                    </p>
                  </div>
                </div>
              </td>
              <td className="flex flex-col ml-auto h-[64px] justify-center w-max md:table-cell text-right md:text-left">
                <p className="text-sm leading-6">2,000.00 ICP</p>
                <p className="text-xs leading-5 text-secondary">
                  14,207.03 USD
                </p>
              </td>
              <td className="px-0 md:px-[10px] hidden md:table-cell">
                <p className="text-sm leading-6">40.08 ICP</p>
                <p className="text-xs leading-5 text-secondary">284.71 USD</p>
              </td>
              <td className="px-0 md:px-[10px] hidden md:table-cell">
                <p className="text-sm leading-5 opacity-80">2 years</p>
              </td>
              <td className="px-0 md:px-[10px] hidden md:table-cell">
                <p
                  className={clsx(
                    "text-sm leading-5 opacity-80",
                    stakingOption !== StakingOptions.Unlocking && "invisible",
                  )}
                >
                  4 months, 124 days
                </p>
              </td>
              <td
                className={clsx(
                  "w-[34px] md:w-[55px] text-right pr-0 md:pr-[30px]",
                )}
              >
                <div
                  className={clsx(
                    "inline-flex items-center gap-1 justify-between cursor-pointer",
                    "transition-all group p-1",
                  )}
                >
                  <IconCaret />
                </div>
              </td>
            </tr>
          </>
        )}
      </Table>
    </ProfileContainer>
  )
}
