import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { Image } from "@nfid-frontend/ui"
import { Input } from "@nfid-frontend/ui"
import {
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpInfo,
  Label,
  Tooltip,
} from "@nfid-frontend/ui"

import { ChooseItem } from "./choose-item"
import { filterGroupedOptionsByTitle } from "./helpers"
import { DefaultTrigger } from "./triggers/default"
import { InputTrigger } from "./triggers/input"
import { IGroupedOptions, IGroupOption } from "./types"

export interface IChooseModal {
  optionGroups: IGroupedOptions[]
  onSelect?: (value: string) => void
  infoText?: string
  label?: string
  title: string
  type?: "default" | "input" | "trigger"
  isFirstPreselected?: boolean
  trigger?: JSX.Element
}

export const ChooseModal = ({
  optionGroups,
  onSelect,
  infoText,
  title,
  label,
  type = "default",
  isFirstPreselected = true,
  trigger,
}: IChooseModal) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<IGroupOption>()
  const [selectedValue, setSelectedValue] = useState("")

  const handleSelect = (option: IGroupOption) => {
    setSelectedValue(option.value)
    setSelectedOption(option)
    setIsModalVisible(false)
  }

  const filteredOptions = useMemo(() => {
    return filterGroupedOptionsByTitle(optionGroups, searchInput)
  }, [optionGroups, searchInput])

  const resetValue = useCallback(() => {
    setSelectedOption(undefined)
    setSelectedValue("")
  }, [])

  useEffect(() => {
    if (optionGroups.length && !selectedOption && isFirstPreselected)
      setSelectedOption(optionGroups[0]?.options[0])
  }, [optionGroups, isFirstPreselected])

  useEffect(() => {
    onSelect && onSelect(selectedValue)
  }, [selectedValue])

  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
<<<<<<< HEAD
      <div
        className={clsx(
          "border border-black rounded-md cursor-pointer h-14",
          "flex items-center justify-between hover:opacity-70",
          "text-black px-4",
        )}
        onClick={() => setIsModalVisible(true)}
      >
        <div className="flex">
          {selectedOption?.icon && (
            <Image
              src={selectedOption?.icon}
              alt={selectedOption?.value}
              className="mr-2.5"
            />
          )}
          <div className="leading-5">
            <p className="text-sm">{selectedOption?.title}</p>
            <p className="text-xs text-gray-400">{selectedOption?.subTitle}</p>
          </div>
        </div>
        <IconCmpArrowRight />
      </div>
=======

      {type === "input" ? (
        <InputTrigger
          placeholder="Recipient principal or account ID"
          onShowModal={() => setIsModalVisible(true)}
          onClearValue={resetValue}
          selectedOption={selectedOption}
          setSelectedValue={(value) => setSelectedValue(value)}
        />
      ) : type === "trigger" ? (
        <div onClick={() => setIsModalVisible(true)}>{trigger}</div>
      ) : (
        <DefaultTrigger
          actionHandler={() => setIsModalVisible(true)}
          selectedOption={selectedOption}
        />
      )}

>>>>>>> 9b3306380 (feat([sc-6070]): prepared ChooseModal)
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
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
            <p className="text-xl font-bold">{title}</p>
          </div>
          {infoText && (
            <Tooltip tip={infoText}>
              <IconCmpInfo className="cursor-pointer hover:opacity-70" />
            </Tooltip>
          )}
        </div>
        <Input
          type="text"
          placeholder="Search"
          icon={<IoIosSearch size="20" />}
          onKeyUp={(e) => setSearchInput(e.target.value)}
          className="my-4"
        />
        <div className="h-full overflow-auto snap-end scroll-pl-1">
          {filteredOptions.map((group) => (
            <div
              className="mt-6"
              key={`group_${group.label}_${group.options.length}`}
            >
              <p className="text-sm font-bold tracking-[0.01em] mb-1.5">
                {group.label}
              </p>
              {group.options.map((option) => (
                <ChooseItem
                  key={`option_${option.value}`}
                  handleClick={() => handleSelect(option)}
                  image={option.icon}
                  title={option.title}
                  subTitle={option.subTitle}
                  innerTitle={option.innerTitle}
                  innerSubtitle={option.innerSubtitle}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
