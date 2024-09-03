import clsx from "clsx"
import { format } from "date-fns"
import produce from "immer"
import { ModalAdvanced } from "packages/ui/src/molecules/modal/advanced"
import React from "react"

import { Loader, Tooltip } from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"

import { RecoveryDevice } from "frontend/integration/identity-manager/devices/state"
import { IconCancel } from "frontend/ui/atoms/icons/cancle"
import { IconCheckMark } from "frontend/ui/atoms/icons/check-mark"
import { PencilIcon } from "frontend/ui/atoms/icons/pencil"
import { TrashIcon } from "frontend/ui/atoms/icons/trash"
import { IconWarning } from "frontend/ui/atoms/icons/warning"
import { P } from "frontend/ui/atoms/typography/paragraph"

import { DeviceIconDecider } from "../device-list/device-icon-decider"
import { DeviceListButtonGroup } from "../device-list/device-list-button-group"
import RecoveryPhraseDeleteModal from "./delete-phrase/phrase-delete-modal"
import RecoveryPhraseProtectModal from "./protect-phrase/phrase-protect-modal"

interface recoveryMethodListItemProps {
  recoveryMethod: RecoveryDevice
  onRecoveryUpdate: (recoveryMethod: RecoveryDevice) => Promise<void>
  onRecoveryProtect?: (phrase: string) => Promise<void>
  onRecoveryDelete: (recoveryMethod: RecoveryDevice) => Promise<void>
  onDeleteRecoveryPhrase: (phrase: string) => Promise<void>
}

export const RecoveryMethodListItem: React.FC<recoveryMethodListItemProps> = ({
  recoveryMethod: initialRecovery,
  onRecoveryUpdate,
  onRecoveryProtect,
  onRecoveryDelete,
  onDeleteRecoveryPhrase,
}) => {
  const [updatedRecovery, setUpdatedRecovery] =
    React.useState<RecoveryDevice | null>(null)

  const recoveryMethod = updatedRecovery ?? initialRecovery

  const [editIconModal, toggleIconModal] = React.useReducer(
    (state) => !state,
    false,
  )

  const [isProtectVisible, toggleProtectVisible] = React.useReducer(
    (state) => !state,
    false,
  )

  const [deleteRecoveryModal, toggleDeleteRecoveryModal] = React.useReducer(
    (state) => !state,
    false,
  )

  const [isEditingLabel, toggleEditLabel] = React.useReducer(
    (state) => !state,
    false,
  )

  const [loading, setLoading] = React.useState(false)

  const handleDeleteRecovery = React.useCallback(
    async (method: RecoveryDevice) => {
      setLoading(true)

      await onRecoveryDelete(method)

      setLoading(false)
      toggleDeleteRecoveryModal()
    },
    [onRecoveryDelete],
  )

  const handleProtectRecovery = React.useCallback(
    async (phrase: string) => {
      setLoading(true)
      onRecoveryProtect && (await onRecoveryProtect(phrase))
      setLoading(false)
    },
    [onRecoveryProtect],
  )

  const handleDeleteRecoveryDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleDeleteRecoveryModal()
    },
    [],
  )

  const handleSelectIcon = React.useCallback(
    (icon: Icon) => {
      setUpdatedRecovery(
        produce(
          updatedRecovery || initialRecovery,
          (draft: RecoveryDevice) => ({
            ...draft,
            icon,
          }),
        ),
      )
    },
    [initialRecovery, updatedRecovery],
  )

  const handleEditRecoveryIconDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleIconModal()
    },
    [],
  )

  const handleOnChangeLabel = React.useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setUpdatedRecovery(
        produce(
          updatedRecovery || initialRecovery,
          (draft: RecoveryDevice) => ({
            ...draft,
            label: value,
          }),
        ),
      )
    },
    [initialRecovery, updatedRecovery],
  )

  const handleOnRecoveryUpdate = React.useCallback(async () => {
    setLoading(true)
    if (updatedRecovery) {
      await onRecoveryUpdate(updatedRecovery)
    }
    setLoading(false)
  }, [onRecoveryUpdate, updatedRecovery])

  const handleOnIconUpdate = React.useCallback(async () => {
    await handleOnRecoveryUpdate()
    toggleIconModal()
  }, [handleOnRecoveryUpdate])

  const handleOnLabelUpdate = React.useCallback(async () => {
    await handleOnRecoveryUpdate()
    toggleEditLabel()
  }, [handleOnRecoveryUpdate])

  return (
    <div
      className={clsx(
        "relative flex flex-row hover:bg-gray-50 hover:rounded transition-colors duration-100 -mx-3",
      )}
    >
      <div className="flex flex-wrap items-center flex-1 px-3 py-0 cursor-pointer select-none peer">
        <div className="mr-4">
          <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
            <DeviceIconDecider
              icon={
                recoveryMethod.isRecoveryPhrase
                  ? Icon.document
                  : recoveryMethod.icon
              }
              onClick={
                isEditingLabel ? () => null : handleEditRecoveryIconDialog
              }
            />
          </div>
        </div>

        <div className="relative flex items-center flex-1 py-2 border-b border-gray-200">
          <div className="flex-1 flex-shrink">
            {isEditingLabel ? (
              <input
                className="flex-1 flex-shrink px-2 py-1 rounded"
                defaultValue={recoveryMethod.label}
                onChange={handleOnChangeLabel}
              ></input>
            ) : (
              <div className="flex-1 flex-shrink">
                <div className="text-gray-700">
                  {recoveryMethod.isRecoveryPhrase
                    ? "Recovery phrase"
                    : recoveryMethod.label}
                </div>
                {recoveryMethod.lastUsed ? (
                  <div className="my-1 text-sm text-secondary">
                    Last activity:{" "}
                    {format(recoveryMethod.lastUsed, "MMM d, yyyy")}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div className="pl-1 md:pl-4">
            <div className="flex space-x-2">
              {recoveryMethod.isRecoveryPhrase &&
                !recoveryMethod.isProtected && (
                  <Tooltip
                    tip={
                      <div>
                        Recovery phrase can be removed without proving you know
                        what it is.
                        <br /> Click to protect this recovery phrase
                      </div>
                    }
                  >
                    <div
                      id="protect-recovery"
                      onClick={toggleProtectVisible}
                      className={"hover:opacity-70 transition-opacity"}
                    >
                      <IconWarning />
                    </div>
                  </Tooltip>
                )}
              <div
                className="hover:bg-gray-50 text-red-base"
                onClick={isEditingLabel ? handleOnLabelUpdate : toggleEditLabel}
                style={{ display: !recoveryMethod.isSecurityKey ? "none" : "" }}
              >
                {isEditingLabel ? <IconCheckMark /> : <PencilIcon />}
              </div>
              <div
                id={
                  recoveryMethod.isRecoveryPhrase
                    ? "delete-recovery-phrase"
                    : ""
                }
                className="hover:bg-gray-50 text-red-base"
                onClick={
                  isEditingLabel ? toggleEditLabel : handleDeleteRecoveryDialog
                }
              >
                {isEditingLabel ? <IconCancel /> : <TrashIcon />}
              </div>
            </div>
          </div>
        </div>
      </div>
      {editIconModal && (
        <ModalAdvanced
          title="Change icon"
          onClose={toggleIconModal}
          primaryButton={{
            text: "Change",
            type: "primary",
            onClick: updatedRecovery ? handleOnIconUpdate : toggleIconModal,
          }}
          secondaryButton={{
            text: "Cancel",
            type: "primary",
            onClick: () => {
              setUpdatedRecovery(null)
              toggleIconModal()
            },
          }}
        >
          <div>
            <P>
              Choose icon for{" "}
              <span className="font-bold">{recoveryMethod.label}</span>
            </P>
            <DeviceListButtonGroup
              onSelect={handleSelectIcon}
              selected={recoveryMethod.icon}
            />
          </div>
        </ModalAdvanced>
      )}
      {deleteRecoveryModal && recoveryMethod.isProtected && (
        <RecoveryPhraseDeleteModal
          onClose={toggleDeleteRecoveryModal}
          onDelete={onDeleteRecoveryPhrase}
        />
      )}
      {deleteRecoveryModal && !recoveryMethod.isProtected && (
        <ModalAdvanced
          title="Delete access point"
          onClose={toggleDeleteRecoveryModal}
          primaryButton={{
            text: "Delete",
            type: "red",
            onClick: async () => {
              await handleDeleteRecovery(recoveryMethod)
            },
          }}
          secondaryButton={{
            text: "Cancel",
            type: "primary",
            onClick: toggleDeleteRecoveryModal,
          }}
        >
          <P>
            Do you really want to delete{" "}
            <span className="font-bold">{recoveryMethod.label}</span> access
            point? This process cannot be undone.
          </P>
        </ModalAdvanced>
      )}
      {isProtectVisible ? (
        <RecoveryPhraseProtectModal
          onClose={toggleProtectVisible}
          onProtect={(phrase) => handleProtectRecovery(phrase)}
        />
      ) : null}
      <Loader isLoading={loading} />
    </div>
  )
}
