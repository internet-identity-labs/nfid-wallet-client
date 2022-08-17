import clsx from "clsx"
import React, { useState } from "react"

import ArrowReceive from "./assets/arrowReceive.svg"
import ArrowSend from "./assets/arrowSend.svg"

import TabsSwitcher from "../tabs-switcher"
import TransactionReceive from "./receive"
import TransactionSendForm, { ITransactionSendForm } from "./send"

interface IProfileNewTransaction extends ITransactionSendForm {
  account: string
  balance: string | number
  isSuccess?: boolean
  onClose: () => void
}

const ProfileNewTransaction: React.FC<IProfileNewTransaction> = ({
  onSendTransaction,
  errorString,
  account,
  balance,
  isSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("Send")
  const tabs = React.useMemo(() => {
    const tabClassNames = "h-[18px] w-[18px] mr-2"

    return [
      {
        name: "Send",
        title: (
          <div className="flex items-center ml-2">
            <div
              className={clsx(
                tabClassNames,
                activeTab === "Send" ? "bg-blue-600" : "bg-black-base",
              )}
              style={{
                WebkitMask: `url(${ArrowSend})`,
                mask: `url(${ArrowSend})`,
              }}
            />
            Send
          </div>
        ),
      },
      {
        name: "Receive",
        title: (
          <div className="flex items-center ml-2">
            <div
              className={clsx(
                tabClassNames,
                activeTab === "Receive" ? "bg-blue-600" : "bg-black-base",
              )}
              style={{
                WebkitMask: `url(${ArrowReceive})`,
                mask: `url(${ArrowReceive})`,
              }}
            />
            Receive
          </div>
        ),
      },
    ]
  }, [activeTab])

  return (
    <div
      className={clsx(
        "rounded-xl shadow-lg pt-8 px-5 max-w-[380px] text-gray-400",
        "w-[95vw] z-50 bg-white absolute",
        "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <TabsSwitcher
        className={clsx(isSuccess && "hidden")}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={(value) => setActiveTab(value)}
        isFitLine={false}
      />
      {activeTab === "Send" ? (
        <TransactionSendForm
          onSendTransaction={onSendTransaction}
          errorString={errorString}
          onClose={onClose}
          isSuccess={isSuccess}
          balance={balance}
        />
      ) : (
        <TransactionReceive account={account} />
      )}
      <div
        className={clsx(
          "flex items-center justify-between",
          "text-xs  leading-[48px]",
          isSuccess && "hidden",
        )}
      >
        <p>Total balance</p>
        <p>{balance} ICP</p>
      </div>
    </div>
  )
}

export default ProfileNewTransaction
