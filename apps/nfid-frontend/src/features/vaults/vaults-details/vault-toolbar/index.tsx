import clsx from "clsx"
import { useState } from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpPencil,
  Popover,
  PopoverTools,
  Switch,
} from "@nfid-frontend/ui"

import { useVault } from "../../hooks/use-vault"
import { VaultArchiveModal } from "./modal-archive-vault"
import { VaultEditModal } from "./modal-edit-vault"

export const VaultToolbar = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isArchivedVisible, setIsArchivedVisible] = useState(true)
  const { vault } = useVault()

  return (
    <>
      <Popover
        trigger={
          <div
            className={clsx(
              "flex items-center justify-center",
              "w-10 h-10 bg-gray-100 rounded-md",
            )}
          >
            <IconCmpDots />
          </div>
        }
        align="end"
      >
        <PopoverTools
          className="w-[180px] mt-1"
          items={[
            {
              icon: <IconCmpPencil />,
              text: "Edit",
              onClick: () => setIsEditModalOpen(true),
            },
            {
              icon: <IconCmpArchive />,
              text: "Archive",
              onClick: () => setIsArchiveModalOpen(true),
            },
          ]}
        >
          <div className="flex border-t-[1px] border-gray-100 py-2 px-2.5 space-x-2">
            <Switch
              onChange={(value) => setIsArchivedVisible(value)}
              isChecked={isArchivedVisible}
            />
            <p>Show archived</p>
          </div>
        </PopoverTools>
      </Popover>
      <VaultEditModal
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        selectedVault={vault}
      />
      <VaultArchiveModal
        isModalOpen={isArchiveModalOpen}
        setIsModalOpen={setIsArchiveModalOpen}
        selectedVault={vault}
      />
    </>
  )
}
