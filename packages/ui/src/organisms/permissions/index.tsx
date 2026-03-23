import { FT } from "frontend/integration/ft/ft"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC, useMemo, useState } from "react"
import { PermissionsIcon } from "../../atoms/icons/permissions-icon"
import { useDarkTheme } from "frontend/hooks"
import clsx from "clsx"

import SortAscendingIcon from "../tokens/assets/sort-ascending.svg"
import SortDefaultIcon from "../tokens/assets/sort-default.svg"
import SortDescendingIcon from "../tokens/assets/sort-descending.svg"
import SortHoverIcon from "../tokens/assets/sort-hover.svg"
import { TableTokenSkeleton } from "../../atoms/skeleton"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { PermissionsToken } from "./PermissionsRow"
import { Button } from "../../molecules/button"
import { ModalComponent } from "@nfid-frontend/ui"
import toaster from "../../atoms/toast"
import { Spinner } from "../../atoms/spinner"
import { SignIdentity } from "@dfinity/agent"
import { PermissionsStateAction } from "frontend/features/permissions/utils"
import { ChooseFromToken } from "../send-receive/components/choose-from-token"
import { IModalType } from "../send-receive/utils"
import { useFormContext } from "react-hook-form"

enum Sorting {
  DEFAULT = "DEFAULT",
  ASCENDING_USD = "ASCENDING_USD",
  DESCENDING_USD = "DESCENDING_USD",
  ASCENDING_ADDRESS = "ASCENDING_ADDRESS",
  DESCENDING_ADDRESS = "DESCENDING_ADDRESS",
}

export interface Allowance {
  token: FT
  address: string
  amountFormatted: string
  usdAmount: string | undefined | null
}

export interface PermissionsProps {
  allowances?: Allowance[]
  isLoading: boolean
  isLoadingMore: boolean
  loadMore: () => Promise<void>
  hasMore: boolean
  identity?: SignIdentity
  identityLoading: boolean
  dispatch: React.Dispatch<PermissionsStateAction>
}

export const Permissions: FC<PermissionsProps> = ({
  allowances,
  isLoading,
  isLoadingMore,
  loadMore,
  hasMore,
  identity,
  identityLoading,
  dispatch,
}) => {
  const isDarkTheme = useDarkTheme()
  const [sorting, setSorting] = useState<Sorting>(Sorting.DEFAULT)
  const [isHovered, setIsHovered] = useState(false)
  const [isHoveredAddress, setIsHoveredAddress] = useState(false)
  const [isRevokeLoading, setIsRevokeLoading] = useState(false)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [chosenRevokeAllowance, setChosenRevokeAllowance] =
    useState<Allowance | null>(null)
  const [chosenUpdateAllowance, setChosenUpdateAllowance] =
    useState<Allowance | null>(null)
  const [isFromResponsive, setIsFromResponsive] = useState(false)

  const { watch } = useFormContext()
  const amount = watch("amount")

  const handleRevoke = async () => {
    if (!chosenRevokeAllowance || !identity) return

    const { token, address, amountFormatted } = chosenRevokeAllowance
    setIsRevokeLoading(true)

    try {
      await token.revokeAllowance(identity, address)
      toaster.success(
        `Approval for ${amountFormatted} has been successfully revoked`,
      )
      dispatch({
        type: "REMOVE_ALLOWANCE",
        payload: { token, address },
      })
    } catch (e) {
      toaster.error(`Revoke error. ${(e as Error).message}`)
    } finally {
      setIsRevokeLoading(false)
      setChosenRevokeAllowance(null)
    }
  }

  const updateAllowance = async () => {
    if (!chosenUpdateAllowance || !identity) return

    const { token, address } = chosenUpdateAllowance
    setIsUpdateLoading(true)

    try {
      await token.updateAllowance(identity, address, amount)
      toaster.success(
        `Approval has been successfully updated to ${amount} ${token.getTokenSymbol()}`,
      )
      dispatch({
        type: "UPDATE_ALLOWANCE",
        payload: { token, address, amount },
      })
    } catch (e) {
      toaster.error(`Approval update error. ${(e as Error).message}`)
    } finally {
      setIsUpdateLoading(false)
      setChosenUpdateAllowance(null)
    }
  }

  const handleUsdSorting = () => {
    let nextSorting: Sorting

    switch (sorting) {
      case Sorting.ASCENDING_USD:
        nextSorting = Sorting.DESCENDING_USD
        break
      case Sorting.DESCENDING_USD:
        nextSorting = Sorting.DEFAULT
        break
      default:
        nextSorting = Sorting.ASCENDING_USD
        break
    }

    setSorting(nextSorting)
  }

  const handleAddressSorting = () => {
    let nextSorting: Sorting

    switch (sorting) {
      case Sorting.ASCENDING_ADDRESS:
        nextSorting = Sorting.DESCENDING_ADDRESS
        break
      case Sorting.DESCENDING_ADDRESS:
        nextSorting = Sorting.DEFAULT
        break
      default:
        nextSorting = Sorting.ASCENDING_ADDRESS
        break
    }

    setSorting(nextSorting)
  }

  const getSortingIcon = (type: "USD" | "ADDRESS") => {
    const isActiveUsd =
      sorting === Sorting.ASCENDING_USD || sorting === Sorting.DESCENDING_USD
    const isActiveAddress =
      sorting === Sorting.ASCENDING_ADDRESS ||
      sorting === Sorting.DESCENDING_ADDRESS

    const isActive =
      (type === "USD" && isActiveUsd) || (type === "ADDRESS" && isActiveAddress)

    if (!isActive) {
      const hovered = type === "USD" ? isHovered : isHoveredAddress
      return hovered || isDarkTheme ? SortHoverIcon : SortDefaultIcon
    }

    if (type === "USD") {
      return sorting === Sorting.ASCENDING_USD
        ? SortAscendingIcon
        : SortDescendingIcon
    } else {
      return sorting === Sorting.ASCENDING_ADDRESS
        ? SortAscendingIcon
        : SortDescendingIcon
    }
  }

  const sortedAllowances = useMemo(() => {
    if (!allowances) return []

    const compareUsdAsc = (a: Allowance, b: Allowance) => {
      const aUsd = a.usdAmount ?? null
      const bUsd = b.usdAmount ?? null
      if (aUsd === null && bUsd === null) return 0
      if (aUsd === null) return 1
      if (bUsd === null) return -1
      return +aUsd - +bUsd
    }

    const compareUsdDesc = (a: Allowance, b: Allowance) => {
      const aUsd = a.usdAmount ?? null
      const bUsd = b.usdAmount ?? null
      if (aUsd === null && bUsd === null) return 0
      if (aUsd === null) return 1
      if (bUsd === null) return -1
      return +bUsd - +aUsd
    }

    const compareAddressAsc = (a: Allowance, b: Allowance) =>
      a.address.localeCompare(b.address)

    const compareAddressDesc = (a: Allowance, b: Allowance) =>
      b.address.localeCompare(a.address)

    switch (sorting) {
      case Sorting.ASCENDING_USD:
        return [...allowances].sort(compareUsdAsc)
      case Sorting.DESCENDING_USD:
        return [...allowances].sort(compareUsdDesc)
      case Sorting.ASCENDING_ADDRESS:
        return [...allowances].sort(compareAddressAsc)
      case Sorting.DESCENDING_ADDRESS:
        return [...allowances].sort(compareAddressDesc)
      default:
        return allowances
    }
  }, [allowances, sorting])

  return (
    <>
      <ProfileContainer
        className="my-[20px] sm:my-[30px] sm:p-[20px] sm:p-[30px] dark:text-white"
        innerClassName="!px-0"
        titleClassName="!px-0"
      >
        {isLoading || !sortedAllowances ? (
          <table className="w-full">
            <TableTokenSkeleton
              tableRowsAmount={5}
              tableCellAmount={getIsMobileDeviceMatch() ? 2 : 5}
            />
          </table>
        ) : sortedAllowances.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 my-[50px]">
            <PermissionsIcon
              strokeColor={isDarkTheme ? "#71717A" : "#9CA3AF"}
            />
            <div className="text-secondary dark:text-zinc-500">
              You haven’t granted token access to anyone yet.
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col">
            <div className="overflow-x-auto scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
              <table className="w-full text-left">
                <thead className="text-secondary dark:text-zinc-500 h-[40px] hidden md:table-header-group">
                  <tr className="text-sm font-bold leading-5">
                    <th className="w-[25%] min-w-[100px] pr-[30px]">Name</th>
                    <th className="w-[25%] pr-[10px] min-w-[100px]">
                      Approved amount
                    </th>
                    <th
                      className={clsx(
                        "w-[25%] pr-[10px] min-w-[100px]",
                        "cursor-pointer hover:text-gray-500",
                      )}
                      onClick={handleUsdSorting}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <span className="flex whitespace-nowrap items-center gap-[6px]">
                        USD amount{" "}
                        <img
                          className="w-[18px] h-[18px] ms-[5px]"
                          src={getSortingIcon("USD")}
                          alt="Sorting"
                        />
                      </span>
                    </th>
                    <th
                      className={clsx(
                        "w-[25%] pr-[10px] min-w-[100px]",
                        "cursor-pointer hover:text-gray-500",
                      )}
                      onClick={handleAddressSorting}
                      onMouseEnter={() => setIsHoveredAddress(true)}
                      onMouseLeave={() => setIsHoveredAddress(false)}
                    >
                      <span className="flex whitespace-nowrap items-center gap-[6px]">
                        Address{" "}
                        <img
                          className="w-[18px] h-[18px] ms-[5px]"
                          src={getSortingIcon("ADDRESS")}
                          alt="Sorting"
                        />
                      </span>
                    </th>
                    <th
                      className={clsx("w-[25%] pr-[10px] min-w-[120px]")}
                    ></th>
                    <th className="w-[30px] lg:w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="h-16 text-sm text-black">
                  {sortedAllowances.map((allowance, index) => (
                    <PermissionsToken
                      key={`${allowance.token.getTokenName()}_${index}`}
                      allowance={allowance}
                      setChosenRevokeAllowance={setChosenRevokeAllowance}
                      setChosenUpdateAllowance={setChosenUpdateAllowance}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {hasMore && (
          <Button
            disabled={isLoadingMore}
            className="block mx-auto mt-[20px]"
            onClick={loadMore}
            type="ghost"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </Button>
        )}
        <ModalComponent
          isVisible={Boolean(chosenRevokeAllowance)}
          onClose={() => {
            setChosenRevokeAllowance(null)
          }}
          className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
        >
          <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-[18px]">
            Revoke approval
          </p>
          <p className="leading-[22px] dark:text-white">
            You are about to revoke the approval for{" "}
            {chosenRevokeAllowance?.amountFormatted} previously granted to{" "}
            {chosenRevokeAllowance?.address}.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <Button
              type="stroke"
              isSmall
              className="w-[115px]"
              onClick={() => setChosenRevokeAllowance(null)}
            >
              Cancel
            </Button>
            <Button
              isSmall
              className="w-[115px]"
              onClick={handleRevoke}
              disabled={identityLoading || !identity || isRevokeLoading}
              icon={isRevokeLoading ? <Spinner /> : null}
            >
              Revoke
            </Button>
          </div>
        </ModalComponent>
        <ModalComponent
          isVisible={Boolean(chosenUpdateAllowance)}
          onClose={() => {
            setChosenUpdateAllowance(null)
          }}
          className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
        >
          <p className="text-[20px] leading-[22px] font-bold dark:text-white mb-5">
            Update approved amount
          </p>
          <p className="mb-1 text-xs dark:text-white">Approved amount</p>
          <ChooseFromToken
            modalType={IModalType.SEND}
            id={"token-allowance-to-update"}
            token={chosenUpdateAllowance?.token}
            usdRate={chosenUpdateAllowance?.token?.getTokenRateFormatted(
              amount || "0",
            )}
            title="Token allowance to update"
            isResponsive={isFromResponsive}
            setIsResponsive={setIsFromResponsive}
          />
          <div className="mt-5 flex gap-2.5">
            <Button
              type="stroke"
              className="w-full"
              onClick={() => setChosenUpdateAllowance(null)}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={updateAllowance}
              disabled={identityLoading || !identity || isUpdateLoading}
              icon={isUpdateLoading ? <Spinner /> : null}
            >
              Save
            </Button>
          </div>
        </ModalComponent>
      </ProfileContainer>
    </>
  )
}
