import clsx from "clsx"
import React, { useState } from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import Pagination from "frontend/ui/molecules/pagination"
import TabsSwitcher from "frontend/ui/organisms/tabs-switcher"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileTransactionsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  sentData: any[]
  receivedData: any[]
}

const tabs = [
  {
    name: "Sent",
    title: <>Sent</>,
  },
  {
    name: "Received",
    title: <>Received</>,
  },
]

const ProfileTransactionsPage: React.FC<IProfileTransactionsPage> = ({
  sentData,
  receivedData,
}) => {
  const [activeTab, setActiveTab] = useState("Sent")
  const [filteredData, setFilteredData] = useState<any[]>([])

  return (
    <ProfileTemplate
      pageTitle="Transactions history"
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
      className="w-full min-w-fit z-[1]"
      containerClassName="overflow-x-auto"
    >
      <TabsSwitcher
        className="mt-2"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {filteredData.length ? (
        <>
          <table className={clsx("text-left w-full mb-16 sm:mb-0")}>
            <thead className={clsx("border-b border-black-base h-16")}>
              <tr className={clsx("font-bold text-sm leading-5")}>
                <th className="pl-4 w-[285px]">Date</th>
                <th className="w-[95px]">Asset</th>
                <th className="w-[160px]">Quantity</th>
                <th className="min-w-[235px] pr-5">From</th>
                <th className="min-w-[235px]">To</th>
              </tr>
            </thead>
            <tbody className={clsx("text-sm text-[#0B0E13] border-b")}>
              {filteredData.map((transaction, index) => (
                <tr
                  className={clsx(
                    "hover:bg-[#F3F4F6] hover:cursor-pointer h-16",
                  )}
                  key={`transaction_${index}`}
                >
                  <td className="pl-4">{transaction.date}</td>
                  <td>{transaction.asset}</td>
                  <td>{transaction.quantity}</td>
                  <td>
                    <span
                      className={clsx(
                        "inline-block max-w-[400px] break-words pr-5",
                      )}
                    >
                      {transaction.from}
                    </span>
                  </td>
                  <td>
                    <span
                      className={clsx("inline-block max-w-[400px] break-words")}
                    >
                      {transaction.to}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div
          className={clsx(
            "w-full h-[50vh]",
            "flex justify-center items-center flex-col",
          )}
        >
          <p className="mb-4 text-sm text-center">
            No recent transactions to display.
          </p>
        </div>
      )}
      <div className={clsx("mt-2 fixed right-4")}>
        <Pagination
          data={activeTab === "Sent" ? sentData : receivedData}
          sliceData={setFilteredData}
        />
      </div>
    </ProfileTemplate>
  )
}

export default ProfileTransactionsPage
