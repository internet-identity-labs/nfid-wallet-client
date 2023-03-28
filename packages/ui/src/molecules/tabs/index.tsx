import * as RadixTabs from "@radix-ui/react-tabs"
import clsx from "clsx"
import React from "react"

export interface ITab {
  value: string
  label: JSX.Element | string
  content?: JSX.Element | string
}

export interface TabsProps {
  tabs: ITab[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  isFitLine?: boolean
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  onValueChange,
  isFitLine = true,
}) => {
  return (
    <RadixTabs.Root defaultValue={defaultValue} onValueChange={onValueChange}>
      <RadixTabs.List
        className={clsx(
          "space-x-0.5 flex w-full mb-2",
          !isFitLine && `grid grid-cols-${tabs.length}`,
        )}
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            className={clsx(
              "radix-state-active:border-b-blue-600 radix-state-active:text-blue-600",
              "pb-1.5 border-b-2 min-w-[150px] border-black",
              "text-left font-bold",
            )}
            value={tab.value}
            key={`radix_tab_${tab.value}`}
            id={`tab_${tab.value}`}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
        <RadixTabs.Trigger
          disabled
          className={clsx(
            "pb-1.5 border-b-2 border-black w-full",
            !isFitLine && "hidden",
          )}
          value="empty"
        >
          &nbsp;
        </RadixTabs.Trigger>
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content
          key={`radix_tabs_content_${tab.value}`}
          value={tab.value}
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
