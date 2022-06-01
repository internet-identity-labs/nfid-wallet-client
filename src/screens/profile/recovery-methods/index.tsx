import clsx from "clsx"
import React, { ReactElement, useState } from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { IconRecovery } from "frontend/design-system/atoms/icons/recovery"
import { USBIcon } from "frontend/design-system/atoms/icons/usb"
import { H5 } from "frontend/design-system/atoms/typography"
import { List } from "frontend/design-system/molecules/list"
import { ModalAdvanced } from "frontend/design-system/molecules/modal/advanced"

import { RecoveryDevice } from "frontend/services/identity-manager/devices/state"

import { RecoveryMethodListItem } from "./recovery-list-item"

interface RecoveryMethodsListProps {
  recoveryMethods: RecoveryDevice[]
  onRecoveryUpdate: (recoveryMethod: RecoveryDevice) => Promise<void>
  onRecoveryDelete: (recoveryMethod: RecoveryDevice) => Promise<void>
  onCreateRecoveryPhrase: () => Promise<void>
  onRegisterRecoveryKey: () => Promise<void>
}

export const RecoveryMethodsList: React.FC<RecoveryMethodsListProps> = ({
  recoveryMethods,
  onRecoveryUpdate,
  onRecoveryDelete,
  onCreateRecoveryPhrase,
  onRegisterRecoveryKey,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hasRecoveryPhrase = React.useMemo(
    () => recoveryMethods.filter((rm) => rm.isRecoveryPhrase).length > 0,
    [recoveryMethods],
  )

  const hasSecurityKey = React.useMemo(
    () => recoveryMethods.filter((rm) => rm.isSecurityKey).length > 0,
    [recoveryMethods],
  )

  const canAddRecoveryMethod = React.useMemo(
    () => !(hasRecoveryPhrase && hasSecurityKey),
    [hasRecoveryPhrase, hasSecurityKey],
  )

  const handleWithLoading = (cb: () => Promise<void>) => async () => {
    setIsLoading(true)
    await cb()
    setIsLoading(false)
    setIsModalVisible(false)
  }

  return (
    <div className={clsx("px-5 md:px-16 pt-8", "bg-white flex-1 md:pt-16")}>
      {isModalVisible && (
        <ModalAdvanced
          onClose={() => setIsModalVisible(false)}
          title={"Account recovery"}
          backgroundClassnames="opacity-40"
        >
          <p className="text-sm">
            Create a secret phrase or add a security key as a backup plan in
            case you lose your other devices.
          </p>
          <div className="mt-3 space-y-2">
            {!hasRecoveryPhrase && (
              <MethodRaw
                onClick={handleWithLoading(onCreateRecoveryPhrase)}
                title="Secret recovery phrase"
                subtitle="A “master password” to keep offline"
                img={<IconRecovery />}
              />
            )}
            {!hasSecurityKey && (
              <MethodRaw
                onClick={handleWithLoading(onRegisterRecoveryKey)}
                title="Security key"
                subtitle="A special USB stick to keep safe"
                img={<USBIcon />}
                isDisabled={hasSecurityKey}
              />
            )}
          </div>
        </ModalAdvanced>
      )}
      <List>
        <List.Header>
          <div className="flex items-center justify-between mb-3">
            <H5>Account recovery methods</H5>

            {canAddRecoveryMethod && (
              <div className="" onClick={() => setIsModalVisible(true)}>
                <PlusIcon className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>
        </List.Header>
        <List.Items className="ml-0">
          {recoveryMethods.length > 0 &&
            recoveryMethods.map((method) => (
              <RecoveryMethodListItem
                key={`${method.label}-${method.lastUsed}`}
                recoveryMethod={method}
                onRecoveryUpdate={onRecoveryUpdate}
                onRecoveryDelete={onRecoveryDelete}
              />
            ))}
          {!recoveryMethods.length && (
            <div className="text-sm">
              <p className="mb-6 font-bold">Don’t get locked out!</p>
              <p>
                Protect your account by adding an account recovery method in
                case your authorized devices are all lost.
              </p>
            </div>
          )}
        </List.Items>
      </List>
      <Loader isLoading={isLoading} />
    </div>
  )
}
interface MethodRawProps {
  img: ReactElement
  title: string
  subtitle: string
  onClick: React.MouseEventHandler
}

const MethodRaw: React.FC<MethodRawProps> = ({
  img,
  title,
  subtitle,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-md hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]"
  >
    <div className="w-[28px] mr-[9px]">{img}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  </div>
)
