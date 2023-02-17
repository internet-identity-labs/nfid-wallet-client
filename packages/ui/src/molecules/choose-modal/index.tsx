import clsx from "clsx"
import { Input } from "packages/ui/src/molecules/input"
import { useEffect, useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import {
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpInfo,
  Label,
  Tooltip,
} from "@nfid-frontend/ui"

import { ChooseItem } from "./choose-item"
import { filterGroupedOptionsByTitle } from "./helpers"
import { IGroupedOptions, IGroupOption } from "./types"

export interface IChooseModal {
  optionGroups: IGroupedOptions[]
  onSelect?: (value: string) => void
  infoText?: string
  label?: string
  title: string
}

export const ChooseModal = ({
  optionGroups,
  onSelect,
  infoText,
  title,
  label,
}: IChooseModal) => {
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<IGroupOption>()

  const handleSelect = (option: IGroupOption) => {
    onSelect && onSelect(option.value)
    setSelectedOption(option)
    setIsModalVisible(false)
  }

  const filteredOptions = useMemo(() => {
    return filterGroupedOptionsByTitle(optionGroups, searchInput)
  }, [optionGroups, searchInput])

  useEffect(() => {
    if (optionGroups.length && !selectedOption)
      setSelectedOption(optionGroups[0]?.options[0])
  }, [optionGroups])

  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
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
            <img
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
        {filteredOptions.map((group) => (
          <div
            className="mt-6 max-h-[380px] overflow-auto"
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
  )
}
