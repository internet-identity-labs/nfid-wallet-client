import clsx from "clsx"
import { ReactNode } from "react"

import { AppBalance } from "frontend/integration/rosetta/queries"
import { APP_ACC_BALANCE_SHEET } from "frontend/integration/rosetta/queries.mocks"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { TableBase, TableHead, TableWrapper } from "frontend/ui/atoms/table"

const GridCell: React.FC<{
  className?: string
  children: ReactNode | ReactNode[]
}> = ({ children, className }) => (
  <td
    className={clsx(
      "relative px-3 flex w-full h-14 group-hover:bg-gray-200 hover:bg-gray-200",
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
}) => (
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
          <CenterEllipsis value={account.accountId} trailingChars={5} />
        </GridCell>
        <GridCell>
          <CenterEllipsis value={account.principalId} trailingChars={3} />
        </GridCell>
      </tr>
    ))}
  </tbody>
)

export const AppAccountBalanceSheet = () => {
  const headings = [
    "Application",
    "Account",
    "ICP balance",
    "USD balance",
    "Account ID",
    "Principal ID",
  ]

  const apps: AppBalance[] = Object.values(APP_ACC_BALANCE_SHEET.applications)

  console.log(">> ", { apps })

  return (
    <TableWrapper>
      <TableBase className="grid-cols-[1fr_1fr_1fr_1fr_minmax(200px,400px)_minmax(200px,400px)]">
        <TableHead sort={[]} headings={headings} />
        <div className="col-span-6 border-b border-gray-900" />
        <>
          {apps.map((app) => (
            <AppRow
              key={app.appName}
              appName={app.appName}
              accounts={app.accounts}
              icon={app.icon}
            />
          ))}
        </>
      </TableBase>
    </TableWrapper>
  )
}
