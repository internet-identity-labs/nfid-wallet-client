import clsx from "clsx"
import { ReactNode } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import { Tooltip } from "@nfid-frontend/ui"

import { AppBalance } from "frontend/features/fungable-token/types"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { TableBase, TableHead, TableWrapper } from "frontend/ui/atoms/table"

interface GridCellProps {
  className?: string
  children: ReactNode | ReactNode[]
  id?: string
}

const GridCell = React.forwardRef<HTMLTableCellElement, GridCellProps>(
  ({ children, className, id, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx("relative px-3 h-14 hover:bg-gray-200", className)}
      {...props}
      id={id}
    >
      {children}
    </td>
  ),
)

const AppRow: React.FC<
  Pick<AppBalance, "accounts" | "appName" | "icon"> & {
    currency: string
    toPresentation?: (balance?: bigint) => number
  }
> = ({ appName, icon, accounts, currency, toPresentation }) => {
  const navigate = useNavigate()
  const copyToClipboard = React.useCallback(
    (type: string, value: string) => (e: React.SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toast.info(`${type} copied to clipboard`, {
        toastId: `copied_${type}_${value}`,
      })
      navigator.clipboard.writeText(value)
    },
    [],
  )

  const navigateToTransactions = React.useCallback(
    (address: string) => () => {
      navigate(`/profile/transactions?wallet=${address}`)
    },
    [navigate],
  )

  return (
    <tbody className={clsx("border-b border-grey-200 group")}>
      {accounts.map((account, i) => (
        <tr
          key={account.address}
          className="pl-10 cursor-pointer hover:bg-gray-200"
          onClick={navigateToTransactions(account.address)}
          id={`account_row_${i}`}
        >
          {i === 0 && (
            <GridCell
              // @ts-ignore FIXME: type doesn't exist
              rowSpan={accounts.length}
              className={clsx(
                "align-top whitespace-nowrap overflow-hidden text-ellipsis group-hover:bg-gray-200",
              )}
              id={`app_name_${i}`}
            >
              <div
                className="flex items-center"
                style={{ height: `calc(1/${accounts.length} * 100%)` }}
              >
                <ApplicationIcon appName={appName} icon={icon} />
                <div className="ml-4 font-semibold">{appName}</div>
              </div>
            </GridCell>
          )}
          <GridCell id={`acc_name_${i}`}>{account.accountName}</GridCell>
          <GridCell id={`token_balance_${i}`}>
            {toPresentation ? toPresentation(account.tokenBalance) : 0}{" "}
            {currency}
          </GridCell>
          <GridCell id={`usd_balance_${i}`}>{account.usdBalance}</GridCell>
          <Tooltip tip="Copy to clipboard">
            <GridCell id={`account_id_${i}`}>
              <CenterEllipsis
                onClick={copyToClipboard("Account ID", account.address)}
                value={account.address}
                trailingChars={3}
                leadingChars={4}
              />
            </GridCell>
          </Tooltip>
          <Tooltip tip="Copy to clipboard">
            <GridCell id={`principal_id_${i}`}>
              <CenterEllipsis
                onClick={copyToClipboard("Principal ID", account.principalId)}
                value={account.principalId}
                trailingChars={3}
                leadingChars={4}
              />
            </GridCell>
          </Tooltip>
        </tr>
      ))}
    </tbody>
  )
}

interface AppAccountBalanceSheetProps {
  apps: AppBalance[]
  currency?: string
  toPresentation?: (balance?: bigint) => number
}

export const AppAccountBalanceSheet: React.FC<AppAccountBalanceSheetProps> = ({
  apps,
  currency = "ICP",
  toPresentation,
}) => {
  const headings = [
    "Application",
    "Account",
    `${currency} balance`,
    "USD balance",
    "Account ID",
    "Principal ID",
  ]

  return (
    <TableWrapper>
      <TableBase>
        <TableHead headings={headings} />
        {apps.map((app) => (
          <AppRow
            key={app.appName}
            currency={currency}
            appName={app.appName}
            accounts={app.accounts}
            icon={app.icon}
            toPresentation={toPresentation}
          />
        ))}
      </TableBase>
    </TableWrapper>
  )
}
