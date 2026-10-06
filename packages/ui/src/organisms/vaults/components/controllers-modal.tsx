import { FC, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "@nfid-frontend/ui"
import { Button, Input } from "@nfid-frontend/ui"

import { Spinner } from "packages/ui/src/atoms/spinner"
import { useForm } from "react-hook-form"
import { ControllersModalProps, UpdateControllersValues } from "../types"

import toaster from "packages/ui/src/atoms/toast"
import { TrashIcon } from "packages/ui/src/atoms/icons/trash"
import { PlusIcon } from "packages/ui/src/atoms/icons/plus"
import { IconApprove } from "packages/ui/src/atoms/icons/approve"
import { IconDecline } from "packages/ui/src/atoms/icons/decline"

const DEFAULT_ERROR = "Something went wrong. Please try again later"

export const ControllersModal: FC<ControllersModalProps> = ({
  isOpen,
  onClose,
  validateAddress,
  updateControllers,
  controllers,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [controllerList, setControllerList] = useState(controllers ?? [])

  const {
    register,
    getValues,
    formState: { errors, isValid },
    reset,
  } = useForm<UpdateControllersValues>({
    mode: "all",
    defaultValues: {
      newController: "",
    },
  })

  useEffect(() => {
    if (!isOpen) {
      setIsInputVisible(false)
      setControllerList(controllers ?? [])
      reset()
    }
  }, [isOpen, controllers, reset])

  const onApprove = () => {
    if (!isValid) return
    const value = getValues("newController")
    setControllerList([...controllerList, value])
    setIsInputVisible(false)
    reset()
  }

  const onDecline = () => {
    setIsInputVisible(false)
    reset()
  }

  const handleUpdateControllers = async () => {
    try {
      setIsLoading(true)
      await updateControllers(controllerList)
      onClose()
    } catch (e) {
      console.error("Edit controllers error", (e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onClose}
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end font-inter",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
        Edit controllers
      </p>
      <p className="text-sm leading-5 text-secondary dark:text-zinc-500 mt-[14px] pb-[11px] border-b border-gray-200 dark:border-zinc-700">
        Controller IDs
      </p>
      <div
        className={clsx(
          "dark:text-white max-h-[338px] overflow-auto",
          "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
          "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        )}
      >
        {controllerList?.map((c, i) => (
          <div
            key={c}
            className={clsx(
              "group leading-5 text-sm py-4.5 px-5 rounded-[6px] flex items-center",
              i !== 0 &&
                "hover:bg-gray-50 dark:hover:bg-[#34343A] transition-all duration-200",
              i === 0 && "!px-3 text-secondary",
            )}
          >
            <p>{c}</p>
            <TrashIcon
              className={clsx(
                "w-6 h-6 ml-auto !text-red-600 cursor-pointer",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                i === 0 && "!hidden",
              )}
              onClick={() =>
                setControllerList(
                  controllerList.filter((_, index) => index !== i),
                )
              }
            />
          </div>
        ))}
      </div>
      {!isInputVisible && (
        <Button
          className="ml-auto text-sm font-bold"
          type="ghost"
          icon={<PlusIcon className="w-[18px]" />}
          onClick={() => setIsInputVisible(true)}
        >
          Add controller
        </Button>
      )}
      {isInputVisible && (
        <div className="flex gap-4 items-center pr-1.5 pl-2.5 mt-2">
          <Input
            className="!mb-0 w-full"
            inputClassName="h-10"
            placeholder="Add controller"
            {...register("newController", {
              required: "Controller address cannot be empty",
              validate: (value) => {
                if (controllerList?.includes(value))
                  return "This controller ID is already in the list"
                return validateAddress(value)(value)
              },
            })}
            errorText={errors.newController?.message}
          />
          <div className="flex items-center gap-4">
            <div
              className="text-teal-600 cursor-pointer dark:text-teal-500"
              onClick={onApprove}
            >
              <IconApprove />
            </div>
            <div
              className="text-black cursor-pointer dark:text-white"
              onClick={onDecline}
            >
              <IconDecline />
            </div>
          </div>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2.5 h-10">
        <Button
          type="stroke"
          isSmall
          className="w-full sm:w-[120px] h-full"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          isSmall
          className="w-full sm:w-[130px] h-full"
          onClick={handleUpdateControllers}
          disabled={
            isInputVisible ||
            isLoading ||
            (controllers?.length === controllerList.length &&
              controllerList.every((c, i) => c === controllers?.[i]))
          }
          iconEnd={isLoading ? <Spinner /> : null}
        >
          Save
        </Button>
      </div>
    </ModalComponent>
  )
}
