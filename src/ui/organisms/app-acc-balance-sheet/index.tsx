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
}> = ({ children, className }) => (
  <td
    className={clsx(
      "flex relative px-3 w-full h-14 group-hover:bg-gray-200 hover:bg-gray-200",
      className,
    )}
  >
    <div className={"flex align-middle items-center h-full w-full"}>
      {children}
    </div>
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
    <tbody
      className={clsx(
        "border-b border-grey-200",
        "hover:bg-gray-200",
        "contents",
      )}
    >
      {accounts.map((account, i) => (
        <tr
          key={account.accountId}
          className="pl-10 cursor-pointer contents group hover:bg-gray-200"
        >
          {i === 0 && (
            <GridCell
              className={clsx(
                "whitespace-nowrap overflow-hidden text-ellipsis",
                `row-span-${accounts.length}`,
              )}
            >
              <ApplicationIcon appName={appName} icon={icon} />
              <div className="ml-4 font-semibold">{appName}</div>
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
              <CenterEllipsis value={account.accountId} trailingChars={5} />
            </TooltipWrap>
          </GridCell>
          <GridCell>
            <TooltipWrap
              tip="Copy to clipboard"
              onClick={copyToClipboard("principalId", account.principalId)}
            >
              <CenterEllipsis value={account.principalId} trailingChars={3} />
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
      <TableBase className="grid grid-rows-3 grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_minmax(200px,400px)_minmax(200px,400px)]">
        <TableHead sort={[]} headings={headings} />
        <div className="col-span-6 border-b border-gray-900" />
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
