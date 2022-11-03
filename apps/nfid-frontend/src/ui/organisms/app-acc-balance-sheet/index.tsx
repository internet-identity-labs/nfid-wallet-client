import clsx from "clsx"
import { ReactNode } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ReactTooltip from "react-tooltip"

import { AppBalance } from "frontend/integration/rosetta/hooks/use-balance-icp-all"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { TableBase, TableHead, TableWrapper } from "frontend/ui/atoms/table"

const TooltipWrap: React.FC<{
  children: ReactNode | ReactNode[]
  tip: string
  onClick: React.ReactEventHandler
}> = ({ children, tip, onClick }) => (
  <>
    <div
      className="flex items-center w-full h-full align-middle"
      data-tip={tip}
      onClick={onClick}
    >
      {children}
    </div>
    <ReactTooltip />
  </>
)

const GridCell: React.FC<{
  className?: string
  children: ReactNode | ReactNode[]
}> = ({ children, className, ...props }) => (
  <td
    className={clsx("relative px-3 h-14 hover:bg-gray-200", className)}
    {...props}
  >
    {children}
  </td>
)

const AppRow: React.FC<Pick<AppBalance, "accounts" | "appName" | "icon">> = ({
  appName,
  icon,
  accounts,
}) => {
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
        >
          {i === 0 && (
            <GridCell
              rowSpan={accounts.length}
              className={clsx(
                "align-top whitespace-nowrap overflow-hidden text-ellipsis group-hover:bg-gray-200",
              )}
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
          <GridCell>{account.accountName}</GridCell>
          <GridCell>{account.icpBalance}</GridCell>
          <GridCell>{account.usdBalance}</GridCell>
          <GridCell>
            <TooltipWrap
              tip="Copy to clipboard"
              onClick={copyToClipboard("Account ID", account.address)}
            >
              <CenterEllipsis
                value={account.address}
                trailingChars={3}
                leadingChars={4}
              />
            </TooltipWrap>
          </GridCell>
          <GridCell>
            <TooltipWrap
              tip="Copy to clipboard"
              onClick={copyToClipboard("Principal ID", account.principalId)}
            >
              <CenterEllipsis
                value={account.principalId}
                trailingChars={3}
                leadingChars={4}
              />
            </TooltipWrap>
          </GridCell>
        </tr>
      ))}
    </tbody>
  )
}

interface AppAccountBalanceSheetProps {
  apps: AppBalance[]
}

export const AppAccountBalanceSheet: React.FC<AppAccountBalanceSheetProps> = ({
  apps,
}) => {
  const headings = [
    "Application",
    "Account",
    "ICP balance",
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
            appName={app.appName}
            accounts={app.accounts}
            icon={app.icon}
          />
        ))}
      </TableBase>
    </TableWrapper>
  )
}
