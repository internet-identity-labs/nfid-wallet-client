import clsx from "clsx"
import React from "react"

import ArrowReceive from "./assets/arrowReceive.svg"
import ArrowSend from "./assets/arrowSend.svg"

import { TabsSwitcher } from "../tabs-switcher"
import { modalTypes } from "./transfer-modal"

interface ITransferModalTabs {
  activeTab: modalTypes
  setActiveTab: (value: string) => void
}

export const TransferModalTabs: React.FC<ITransferModalTabs> = ({
  activeTab,
  setActiveTab,
}) => {
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
    <TabsSwitcher
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isFitLine={false}
      className="mb-2.5"
    />
  )
}
