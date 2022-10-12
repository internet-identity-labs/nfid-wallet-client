import clsx from "clsx"
import { ReactNode } from "react"
import React from "react"
import { toast } from "react-toastify"
import ReactTooltip from "react-tooltip"

import { AppBalance } from "frontend/integration/rosetta/queries"
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
    <div className={"flex items-center h-full w-full"}>{children}</div>
  </td>
)

const AppRow: React.FC<Pick<AppBalance, "accounts" | "appName" | "icon">> = ({
  appName,
  icon,
  accounts,
}) => {
  const copyToClipboard = React.useCallback(
    (type: string, value: string) => () => {
      toast.info(`${type} copied to clipboard`, {
        toastId: `copied_${type}_${value}`,
      })
      navigator.clipboard.writeText(value)
    },
    [],
  )
  return (
    <tbody className={clsx("border-b border-grey-200")}>
      {accounts.map((account, i) => (
        <tr
          key={account.accountId}
          className="pl-10 cursor-pointer hover:bg-gray-200"
        >
          {i === 0 && (
            <GridCell
              rowspan={accounts.length}
              className={clsx(
                "whitespace-nowrap overflow-hidden text-ellipsis",
              )}
            >
              <div className="flex items-center">
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
              onClick={copyToClipboard("accountId", account.accountId)}
            >
              <CenterEllipsis
                value={account.accountId}
                trailingChars={3}
                leadingChars={4}
              />
            </TooltipWrap>
          </GridCell>
          <GridCell>
            <TooltipWrap
              tip="Copy to clipboard"
              onClick={copyToClipboard("principalId", account.principalId)}
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
