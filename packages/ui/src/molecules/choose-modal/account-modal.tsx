import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"
import { UseFormRegisterReturn } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"
import InfiniteScroll from "react-infinite-scroll-component"
import { trimConcat } from "@nfid/utils"

import { IconCmpWarning } from "@nfid/ui"
import { Input } from "@nfid/ui"
import { IconCmpArrow, Label, Tooltip } from "@nfid/ui"

import { ChooseAccountItem } from "./choose-account-item"
import { filterGroupedOptionsByTitle, findOptionByValue } from "./helpers"
import { DefaultTrigger } from "./triggers/default"
import { InputTrigger } from "./triggers/input"
import { SmallTrigger } from "./triggers/small"
import { IGroupedOptions, IGroupOption } from "./types"

export interface IChooseAccountModal {
  loadMore?: () => void
  optionGroups: IGroupedOptions[]
  preselectedValue?: string
  onSelect?: (value: string) => void
  onOpen?: () => void
  warningText?: string | JSX.Element
  label?: string
  title: string
  type?: "default" | "input" | "trigger" | "small"
  isFirstPreselected?: boolean
  trigger?: JSX.Element
  placeholder?: string
  errorText?: string
  registerFunction?: UseFormRegisterReturn<string>
  iconClassnames?: string
  isSmooth?: boolean
}

export const ChooseAccountModal = ({
  loadMore,
  optionGroups,
  preselectedValue,
  onSelect,
  onOpen: _onOpen,
  warningText,
  title,
  label,
  type = "default",
  isFirstPreselected = true,
  trigger,
  placeholder,
  errorText,
  registerFunction,
  iconClassnames,
  isSmooth = false,
}: IChooseAccountModal) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<IGroupOption>()
  const [selectedValue, setSelectedValue] = useState(preselectedValue ?? "")
  const [hasMore, setHasMore] = useState(Boolean(loadMore))

  const handleSelect = useCallback(
    (option: IGroupOption) => {
      setSelectedValue(option.value)
      setSelectedOption(option)
      setTimeout(
        () => {
          setIsModalVisible(false)
        },
        isSmooth ? 100 : 0,
      )
    },
    [isSmooth],
  )

  const filteredOptions = useMemo(() => {
    return filterGroupedOptionsByTitle(optionGroups, searchInput)
  }, [optionGroups, searchInput])

  const resetValue = useCallback(() => {
    setSelectedOption(undefined)
    setSelectedValue("")
  }, [])

  const fetchMoreData = () => {
    if (loadMore) {
      loadMore()
    } else {
      setHasMore(false)
    }
  }

  useEffect(() => {
    if (!optionGroups.length && selectedOption) return

    if (preselectedValue) {
      const option = findOptionByValue(optionGroups, preselectedValue)
      if (!option) return

      setSelectedOption(option)
      setSelectedValue(option?.value ?? "")
      return
    }

    if (optionGroups.length && !selectedOption && isFirstPreselected) {
      const option = optionGroups[0]?.options[0]
      setSelectedOption(option)
      onSelect && option?.value && onSelect(option?.value)
    }
  }, [
    optionGroups,
    isFirstPreselected,
    preselectedValue,
    selectedOption,
    onSelect,
  ])

  useEffect(() => {
    onSelect && onSelect(selectedValue)
  }, [selectedValue, onSelect])

  return (
    <div className="flex flex-col shrink-0" id={"choose_modal"}>
      {label && <Label className="mb-1 dark:text-white">{label}</Label>}

      {type === "input" ? (
        <InputTrigger
          placeholder={placeholder}
          onShowModal={
            optionGroups.length ? () => setIsModalVisible(true) : undefined
          }
          onClearValue={resetValue}
          selectedOption={selectedOption}
          errorText={errorText}
          registerFunction={registerFunction}
          setSelectedValue={(value) => setSelectedValue(value)}
        />
      ) : type === "trigger" ? (
        <div className="flex shrink-0" onClick={() => setIsModalVisible(true)}>
          {trigger}
        </div>
      ) : type === "small" ? (
        <SmallTrigger
          actionHandler={() => setIsModalVisible(true)}
          selectedOption={selectedOption}
          iconClassnames={iconClassnames}
          id={"option_" + label}
        />
      ) : (
        <DefaultTrigger
          actionHandler={() => setIsModalVisible(true)}
          selectedOption={selectedOption}
          iconClassnames={iconClassnames}
          id={"default_trigger_" + label}
        />
      )}

      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
          "flex flex-col rounded-xl",
          !isModalVisible && "hidden",
        )}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalVisible(false)}
            >
              <IconCmpArrow className="mr-2" />
            </div>
            <p className="text-xl font-bold leading-10">{title}</p>
          </div>
          {warningText && (
            <Tooltip tip={warningText}>
              <IconCmpWarning className="cursor-help hover:opacity-70 text-orange" />
            </Tooltip>
          )}
        </div>
        <Input
          type="text"
          placeholder="Search by token name"
          inputClassName="!border-black"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        <div
          className={clsx(
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
          )}
          id={hasMore ? "scrollable-area" : "no-scroll"}
        >
          <InfiniteScroll
            dataLength={filteredOptions.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={null}
            scrollableTarget="scrollable-area"
            scrollThreshold={0.95}
          >
            {filteredOptions.map((group, index) => (
              <div
                id={`option_group_${group.label.replace(/\s/g, "")}`}
                key={`group_${group.label}_${group.options.length}_${index}`}
              >
                {group.options.map((option, i) => (
                  <ChooseAccountItem
                    key={`option_${option.value}_group_${index}_${i}`}
                    handleClick={() => handleSelect(option)}
                    image={option.icon}
                    title={option.title}
                    subTitle={option.subTitle}
                    innerTitle={option.innerTitle}
                    innerSubtitle={option.innerSubtitle}
                    iconClassnames={iconClassnames}
                    badgeText={option.badgeText}
                    id={trimConcat("choose_option_", option.title)}
                  />
                ))}
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}
