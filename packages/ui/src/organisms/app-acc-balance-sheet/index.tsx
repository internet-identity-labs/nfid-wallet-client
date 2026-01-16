import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import {
  AccountBalance,
  AppBalance,
} from "packages/integration/src/lib/asset/types"
import toaster from "packages/ui/src/atoms/toast"
import { ReactNode, useMemo } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { Tooltip, CenterEllipsis, ApplicationIcon } from "@nfid-frontend/ui"
import { Blockchain } from "@nfid/integration/token/types"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { TableBase, TableHead, TableWrapper } from "../../atoms/table"

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
    blockchain: string
    toPresentation?: (balance?: bigint) => number | string
  }
> = ({ appName, icon, accounts, currency, blockchain, toPresentation }) => {
  const navigate = useNavigate()
  const copyToClipboard = React.useCallback(
    (type: string, value: string) => (e: React.SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toaster.info(`${type} copied to clipboard`, {
        toastId: `copied_${type}_${value}`,
      })
      navigator.clipboard.writeText(value)
    },
    [],
  )

  const navigateToTransactions = React.useCallback(
    (account: AccountBalance) => () => {
      navigate(`${ProfileConstants.base}/${ProfileConstants.activity}`, {
        state: {
          wallet: {
            label: `${appName} ${account.accountName}`,
            value: AccountIdentifier.fromPrincipal({
              principal: Principal.fromText(account.principalId),
            }).toHex(),
          },
          blockchain,
        },
      })
    },
    [appName, navigate, blockchain],
  )

  return (
    <tbody className={clsx("border-b border-grey-200 group")}>
      {accounts.map((account, i) => (
        <tr
          key={account.address}
          className="pl-10 cursor-pointer hover:bg-gray-200"
          onClick={navigateToTransactions(account)}
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
          {blockchain === Blockchain.IC && (
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
          )}
        </tr>
      ))}
    </tbody>
  )
}

interface AppAccountBalanceSheetProps {
  apps: AppBalance[]
  currency?: string
  blockchain?: string
  toPresentation?: (balance?: bigint) => number | string
}

export const AppAccountBalanceSheet: React.FC<AppAccountBalanceSheetProps> = ({
  apps,
  currency = "ICP",
  blockchain = "Internet Computer",
  toPresentation,
}) => {
  const headings = useMemo(() => {
    const heads = [
      "Application",
      "Account",
      `${currency} balance`,
      "USD balance",
      "Account ID",
    ]
    if (blockchain === Blockchain.IC) heads.push("Principal ID")
    return heads
  }, [blockchain, currency])

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
            blockchain={blockchain}
            toPresentation={toPresentation}
          />
        ))}
      </TableBase>
    </TableWrapper>
  )
}
