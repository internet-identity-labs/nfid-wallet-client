import { FC, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "@nfid-frontend/ui"
import { Button, Input } from "@nfid-frontend/ui"

import { Spinner } from "packages/ui/src/atoms/spinner"
import { useForm } from "react-hook-form"
import {
  PolicyUpdateType,
  UpdatePolicyFormValues,
  UpdayePolicyModalProps,
} from "../types"

import toaster from "packages/ui/src/atoms/toast"
import { RangeSlider } from "packages/ui/src/atoms/range-slider"
import { TrashIcon } from "packages/ui/src/atoms/icons/trash"
import { decodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc"
import { renderPolicyUpdateTitle } from "../utils"

const DEFAULT_ERROR = "Something went wrong. Please try again later"

export const PolicyUpdateModal: FC<UpdayePolicyModalProps> = ({
  isOpen,
  onClose,
  type,
  setType,
  validateAddress,
  addMember,
  updateMember,
  removeMember,
  updateQuorum,
  selectedMember,
  approversCurrentQuantity,
  approversQuantity,
  setApproversQuantity,
  membersQuantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UpdatePolicyFormValues>({
    mode: "all",
    defaultValues: {
      approverName: "",
    },
  })

  useEffect(() => {
    if (!isOpen) {
      reset({ approverName: "", approverAddress: "" })
    } else if (type === PolicyUpdateType.EDIT_APPROVER && selectedMember) {
      reset({ approverName: selectedMember.name ?? "", approverAddress: "" })
    }
  }, [isOpen, type, selectedMember, reset])

  const handleUpdateQuorum = async () => {
    if (!approversQuantity) return

    try {
      setIsLoading(true)
      await updateQuorum(approversQuantity)
      onClose()
    } catch (e) {
      console.error((e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = handleSubmit(
    async ({ approverName, approverAddress }) => {
      try {
        setIsLoading(true)
        const { owner, subaccount } = decodeIcrcAccount(approverAddress)
        await addMember(owner, approverName, subaccount)
        onClose()
      } catch (e) {
        console.error((e as Error).message)
        toaster.error(DEFAULT_ERROR)
      } finally {
        setIsLoading(false)
      }
    },
  )

  const handleRemoveMember = async () => {
    if (!selectedMember) return
    try {
      setIsLoading(true)
      await removeMember(selectedMember.userId)
      onClose()
    } catch (e) {
      console.error((e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMember = handleSubmit(async ({ approverName }) => {
    if (!selectedMember) return
    try {
      setIsLoading(true)
      await updateMember(selectedMember.userId, approverName)
      onClose()
    } catch (e) {
      console.error((e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  })

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
        {renderPolicyUpdateTitle(type)}
      </p>
      {type === PolicyUpdateType.ADD_APPROVER && (
        <>
          <Input
            className="!mb-4"
            inputClassName="h-10 !border-black dark:!border-white"
            labelText="Approver name"
            placeholder="Enter approver name"
            {...register("approverName", {
              required: "Approver name cannot be empty",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            errorText={errors.approverName?.message}
          />
          <Input
            className="!mb-4"
            inputClassName="h-10 !border-black dark:!border-white"
            labelText="Wallet address"
            placeholder="Enter approver address"
            {...register("approverAddress", {
              required: "Approver address cannot be empty",
              validate: (value) => validateAddress(value)(value),
            })}
            errorText={errors.approverAddress?.message}
          />
        </>
      )}
      {type === PolicyUpdateType.EDIT_APPROVER && (
        <>
          <Input
            className="!mb-4"
            inputClassName="h-10 !border-black dark:!border-white"

            labelText="Approver name"
            placeholder="Enter approver name"
            {...register("approverName", {
              required: "Approver name cannot be empty",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            errorText={errors.approverName?.message}
          />
          <Input
            className="!mb-0"
            inputClassName="h-10 text-sm text-gray-500 dark:text-zinc-500 !font-normal !border-0"
            labelText="Wallet address"
            disabled
            value={selectedMember?.account?.owner.toText() ?? ""}
          />
        </>
      )}
      {type === PolicyUpdateType.REMOVE_APPROVER && (
        <div className="dark:text-white">
          <p className="text-sm leading-5">
            Are you sure you want to remove this approver from your NFID Vault?
          </p>
          <p className="my-5 text-sm leading-5">
            <b>Important:</b> This approver will be able to authorize current
            transactions in the queue until this transaction is approved.
          </p>
          <p className="leading-6 font-bold tracking-[0.3px] mb-2.5">
            Update approval threshold
          </p>
        </div>
      )}
      {type !== PolicyUpdateType.EDIT_APPROVER && (
        <>
          <p className="dark:text-white text-sm leading-5 mb-5 tracking-[0.3px]">
            <b>
              {type === PolicyUpdateType.REMOVE_APPROVER &&
              approversQuantity === membersQuantity
                ? approversQuantity! - 1
                : approversQuantity}
            </b>{" "}
            of{" "}
            <b>
              {type === PolicyUpdateType.ADD_APPROVER
                ? membersQuantity + 1
                : type === PolicyUpdateType.REMOVE_APPROVER
                  ? membersQuantity - 1
                  : membersQuantity}
            </b>{" "}
            approvals will be required to initiate transactions and changes to
            NFID Vault settings once this approver is added.
          </p>
          {!(
            type === PolicyUpdateType.REMOVE_APPROVER && membersQuantity === 2
          ) && (
            <RangeSlider
              value={approversQuantity}
              setValue={setApproversQuantity}
              min={1}
              //max={membersQuantity}
              max={
                type === PolicyUpdateType.ADD_APPROVER
                  ? membersQuantity + 1
                  : type === PolicyUpdateType.REMOVE_APPROVER
                    ? membersQuantity - 1
                    : membersQuantity
              }
              step={1}
              showMarks
              segmentGap={2}
              highlightedSegments={
                type === PolicyUpdateType.ADD_APPROVER
                  ? [membersQuantity]
                  : type === PolicyUpdateType.REMOVE_APPROVER
                    ? [membersQuantity + 1]
                    : [membersQuantity - 1]
              }
              className="!px-0"
            />
          )}
        </>
      )}

      {type === PolicyUpdateType.THRESHOLD && (
        <div className="flex gap-5 mt-5">
          <div className="mt-2.5 w-6 h-2 bg-orange-600 rounded-[10px]"></div>
          <p className="text-xs leading-[19px] text-gray-500 dark:text-zinc-400">
            We recommend at least one fewer approval required than total, in
            case one is <br className="hidden sm:block" />
            lost or stolen.
          </p>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2.5 h-10">
        {type === PolicyUpdateType.EDIT_APPROVER && (
          <Button
            type="red"
            isSmall
            className="!px-0 w-10 mr-auto"
            icon={<TrashIcon className="w-[18px] h-[18px] text-white" />}
            onClick={() => setType(PolicyUpdateType.REMOVE_APPROVER)}
          />
        )}
        <Button
          type="stroke"
          isSmall
          className="w-full sm:w-[120px] h-full"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type={type === PolicyUpdateType.REMOVE_APPROVER ? "red" : "primary"}
          isSmall
          className="w-full sm:w-[130px] h-full"
          onClick={
            type === PolicyUpdateType.ADD_APPROVER
              ? handleAddMember
              : type === PolicyUpdateType.EDIT_APPROVER
                ? handleUpdateMember
                : type === PolicyUpdateType.REMOVE_APPROVER
                  ? handleRemoveMember
                  : handleUpdateQuorum
          }
          disabled={
            isLoading ||
            ((type === PolicyUpdateType.ADD_APPROVER ||
              type === PolicyUpdateType.EDIT_APPROVER) &&
              !isValid) ||
            (approversCurrentQuantity === approversQuantity &&
              type === PolicyUpdateType.THRESHOLD)
          }
          iconEnd={isLoading ? <Spinner /> : null}
        >
          {type === PolicyUpdateType.REMOVE_APPROVER
            ? "Remove"
            : type === PolicyUpdateType.ADD_APPROVER
              ? "Add"
              : "Save"}
        </Button>
      </div>
    </ModalComponent>
  )
}
