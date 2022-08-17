import clsx from "clsx"
import React, { useState } from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { SendReceiveButton } from "frontend/ui/atoms/send-receive-button"
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
      className="w-full mt-32 min-w-fit sm:mt-0"
      headerClassName="fixed left-0 top-0 sm:relative"
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
                <th className="pl-4 min-w-[285px]">Date</th>
                <th className="min-w-[95px]">Asset</th>
                <th className="min-w-[160px]">Quantity</th>
                <th className="min-w-[235px]">From</th>
                <th className="min-w-[235px]">To</th>
                <th className="min-w-[235px]">Note</th>
              </tr>
            </thead>
            <tbody className={clsx("text-sm text-[#0B0E13] border-b")}>
              {filteredData.map((transaction) => (
                <tr
                  className={clsx(
                    "hover:bg-[#F3F4F6] hover:cursor-pointer h-16",
                  )}
                >
                  <td className="pl-4">{transaction.datetime}</td>
                  <td>{transaction.asset}</td>
                  <td>{transaction.quantity}</td>
                  <td>
                    <span
                      className={clsx("inline-block w-[214px] break-words")}
                    >
                      {transaction.from}
                    </span>
                  </td>
                  <td>
                    <span
                      className={clsx("inline-block w-[214px] break-words")}
                    >
                      {transaction.to}
                    </span>
                  </td>
                  <td>{transaction.note}</td>
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
            Your transactions list is empty. You can create your first
            transaction using the Send / Receive button.
          </p>
          <SendReceiveButton />
        </div>
      )}
      <div className={clsx("mt-[30px] fixed right-4")}>
        <Pagination
          data={activeTab === "Sent" ? sentData : receivedData}
          sliceData={setFilteredData}
        />
      </div>
    </ProfileTemplate>
  )
}

export default ProfileTransactionsPage
