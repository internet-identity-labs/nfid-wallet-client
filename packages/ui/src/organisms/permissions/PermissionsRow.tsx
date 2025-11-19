import clsx from "clsx"
import { FC } from "react"
import {
  ImageWithFallback,
  IconNftPlaceholder,
  CopyAddress,
  Button,
  Skeleton,
} from "@nfid-frontend/ui"
import { Allowance } from "."

interface PermissionsRowProps {
  allowance?: Allowance
  onChooseAllowance: (a: Allowance) => void
}

export const PermissionsToken: FC<PermissionsRowProps> = ({
  allowance,
  onChooseAllowance,
}) => {
  if (!allowance) return null
  const { token, address, usdAmount, amountFormatted } = allowance
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
              onClick={() => onChooseAllowance(allowance)}
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
          <Button
            type="stroke"
            isSmall
            onClick={() => onChooseAllowance(allowance)}
          >
            Revoke
          </Button>
        </td>
      </tr>
    </>
  )
}
