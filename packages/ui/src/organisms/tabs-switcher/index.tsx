import clsx from "clsx"
import React from "react"

import Tab from "./tab"

export interface TabProps {
  name: string
  title: JSX.Element
}

interface ITabsSwitcher extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TabProps[]
  activeTab: string
  setActiveTab: (value: string) => void
  isFitLine?: boolean
}

export const TabsSwitcher: React.FC<ITabsSwitcher> = ({
  tabs,
  className,
  activeTab,
  setActiveTab,
  isFitLine = true,
}) => {
  return (
    <div className={clsx("flex", !isFitLine && "grid grid-cols-2", className)}>
      {tabs.map((tab) => {
        return (
          <Tab
            key={`tab_${tab.name}`}
            isActive={activeTab === tab.name}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.title}
          </Tab>
        )
      })}
      <div
        className={clsx(
          "pb-1.5 border-b-2 border-black-base w-full",
          isFitLine ? "flex" : "hidden",
        )}
      />
    </div>
  )
}
