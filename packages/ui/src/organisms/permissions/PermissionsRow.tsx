import clsx from "clsx"
import { FC, useMemo, useState } from "react"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  CopyAddress,
  Button,
  Skeleton,
} from "@nfid-frontend/ui"
import { Allowance } from "."
import { Principal } from "@dfinity/principal"
import { useIdentity } from "frontend/hooks/identity"
import { Spinner } from "../../atoms/spinner"
import { mutate } from "@nfid/swr"
import { FT } from "frontend/integration/ft/ft"
import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"
import { updateAllowancesAfterRevoke } from "frontend/features/transfer-modal/utils"
import toaster from "../../atoms/toast"
import { ModalComponent } from "../../molecules/modal/index-v0"

export const PermissionsToken: FC<Allowance> = ({
  token,
  address,
  usdAmount,
  amountFormatted,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { identity, isLoading: identityLoading } = useIdentity()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRevoke = async () => {
    setIsLoading(true)
    try {
      await token.revokeAllowance(identity!, Principal.from(address))
      toaster.success(
        `Access to ${amountFormatted} has been successfully revoked`,
      )
      mutate<
        {
          token: FT
          allowances: AllowanceDetailDTO[]
        }[]
      >(
        "allowances",
        (current) => updateAllowancesAfterRevoke(current, token, address),
        false,
      )
    } catch (e) {
      toaster.error("An error occurred while revoking access.")
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <tr
        id={`token_${token.getTokenName().replace(/\s+/g, "")}`}
        className="py-5 border-b border-gray-100 md:py-0 md:border-0"
      >
        <td className="flex md:items-center py-[10px] md:py-0 md:h-16 pr-[10px] md:pr-[30px] flex-grow min-w-0 w-[100%] md:w-auto mb-5 mt-2.5 md:mt-0 md:mb-0">
          <div className="w-[24px] h-[24px] md:w-[40px] md:h-[40px] mr-[12px] rounded-full bg-zinc-50 mt-3 md:mt-0">
            <ImageWithFallback
              alt={`${token.getTokenSymbol()}`}
              fallbackSrc={IconNftPlaceholder}
              src={`${token.getTokenLogo()}`}
              className={clsx(
                "w-[24px] h-[24px] md:w-[40px] md:h-[40px]",
                "rounded-full object-cover min-w-[24px] md:min-w-[40px]",
              )}
            />
          </div>
          <div className="md:overflow-hidden md:text-ellipsis md:whitespace-nowrap">
            <p
              className="text-sm dark:text-white font-semibold leading-[25px] flex items-center"
              id={`token_${token.getTokenName().replace(/\s/g, "")}_currency`}
            >
              {token.getTokenSymbol()}
            </p>
            <p className="text-secondary text-xs leading-[20px] dark:text-zinc-400">
              {token.getTokenName()}
            </p>
            <CopyAddress
              className="mt-3 dark:text-white md:hidden"
              address={address}
              leadingChars={6}
              trailingChars={4}
            />
          </div>
        </td>
        <td
          id={`token_${token
            .getTokenCategoryFormatted()
            .replace(/\s/g, "")}_category`}
          className="w-[50%] md:w-auto md:pr-[10px] min-w-[120px] dark:text-white text-right md:text-left mt-2.5 md:mt-0 md:mb-0"
        >
          {amountFormatted}
          <div className="md:hidden">
            <span className="text-gray-400 dark:text-zinc-500">
              {usdAmount === undefined ? (
                <Skeleton
                  className={clsx("max-w-full h-[10px] w-[100px] mt-2 ml-auto")}
                />
              ) : usdAmount !== null ? (
                <div>
                  <div
                    id={`token_${token.getTokenName().replace(/\s/g, "")}_price`}
                  >
                    {`${usdAmount} USD`}
                  </div>
                </div>
              ) : (
                "Not listed"
              )}
            </span>
            <Button
              className="mt-2.5"
              type="stroke"
              isSmall
              onClick={() => setIsModalOpen(true)}
            >
              Revoke
            </Button>
          </div>
        </td>
        <td className="pr-[10px] hidden md:table-cell min-w-[120px] dark:text-white">
          {usdAmount === undefined ? (
            <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
          ) : usdAmount !== null ? (
            <div>
              <div
                id={`token_${token.getTokenName().replace(/\s/g, "")}_price`}
              >
                {`${usdAmount} USD`}
              </div>
            </div>
          ) : (
            "Not listed"
          )}
        </td>
        <td
          id={`token_${token.getTokenName().replace(/\s/g, "")}_balance`}
          className="hidden md:table-cell pr-[10px] text-right md:text-left pr-[10px] flex-grow min-w-0 md:w-auto min-w-[120px]"
        >
          <CopyAddress
            className="dark:text-white"
            address={address}
            leadingChars={6}
            trailingChars={4}
          />
        </td>
        <td
          className="hidden md:table-cell w-[24px] min-w-[30px] lg:min-w-[50px] lg:ps-[25px]"
          id={`${token.getTokenName()}_options`}
        >
          <Button type="stroke" isSmall onClick={() => setIsModalOpen(true)}>
            Revoke
          </Button>
        </td>
      </tr>
      <ModalComponent
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
      >
        <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-[18px]">
          Revoke approve
        </p>
        <p className="leading-[22px] dark:text-white">
          You are going to revoke approve of {amountFormatted} that you
          previously give to {address}.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button
            type="stroke"
            isSmall
            className="w-[115px]"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            isSmall
            className="w-[115px]"
            onClick={handleRevoke}
            disabled={identityLoading || !identity || isLoading}
            icon={isLoading ? <Spinner /> : null}
          >
            Revoke
          </Button>
        </div>
      </ModalComponent>
    </>
  )
}
