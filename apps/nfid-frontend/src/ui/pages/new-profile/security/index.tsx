import clsx from "clsx"
import React from "react"

import {
  LegacyDevice,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { IconRecovery } from "frontend/ui/atoms/icons/recovery"
import { USBIcon } from "frontend/ui/atoms/icons/usb"
import { Loader } from "frontend/ui/atoms/loader"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"
import { DeviceListItem } from "frontend/ui/organisms/device-list/device-list-item"
import AddRecoveryPhraseModal from "frontend/ui/organisms/recovery-list/add-phrase"
import { MethodRaw } from "frontend/ui/organisms/recovery-list/method-raw-item"
import { RecoveryMethodListItem } from "frontend/ui/organisms/recovery-list/recovery-list-item"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileSecurityPage extends React.HTMLAttributes<HTMLDivElement> {
  onDeviceDelete: (device: LegacyDevice) => Promise<void>
  onDeviceUpdate: (device: LegacyDevice) => Promise<void>
  onRecoveryDelete: (method: RecoveryDevice) => Promise<void>
  onRecoveryUpdate: (method: RecoveryDevice) => Promise<void>
  onRecoveryProtect: (phrase: string) => Promise<void>
  onCreateRecoveryPhrase: (protect?: boolean) => Promise<string>
  onDeleteRecoveryPhrase: (phrase: string) => Promise<void>
  onRegisterRecoveryKey: () => Promise<void>
  devices: LegacyDevice[]
  recoveryMethods: RecoveryDevice[]
  socialDevices?: LegacyDevice[]
  walletDevices?: LegacyDevice[]
}

const ProfileSecurityPage: React.FC<IProfileSecurityPage> = ({
  onDeviceDelete,
  onDeviceUpdate,
  devices,
  onRecoveryDelete,
  onRecoveryUpdate,
  onRecoveryProtect,
  onCreateRecoveryPhrase,
  onDeleteRecoveryPhrase,
  onRegisterRecoveryKey,
  recoveryMethods,
  socialDevices,
  walletDevices,
}) => {
  console.log({ devices, socialDevices })
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [phrase, setPhrase] = React.useState("")

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

  const handleWithLoading =
    (cb: () => Promise<void | string>, callback?: (res: any) => void) =>
    async () => {
      setIsLoading(true)
      const res = await cb()
      callback && callback(res)
      setIsLoading(false)
      setIsModalVisible(false)
    }

  return (
    <ProfileTemplate pageTitle="Security">
      <ProfileContainer
        title="Authorized devices"
        subTitle="Where you can sign in from"
      >
        {devices.map((device) => (
          <DeviceListItem
            key={`${device.label}-${device.browser}-${device.lastUsed}`}
            device={device}
            onDeviceUpdate={onDeviceUpdate}
            onDelete={onDeviceDelete}
          />
        ))}
      </ProfileContainer>
      <ProfileContainer
        className="mt-[30px] relative mb-12 sm:mb-0"
        title="Account recovery methods"
        id="recovery-phrase"
        subTitle={
          recoveryMethods.length
            ? "Ways NFID can verify it’s you"
            : "Ways NFID can verify it’s you. Protect your account by adding an account recovery method in case your authorized devices are all lost."
        }
      >
        {canAddRecoveryMethod && (
          <div
            id="add-recovery"
            className=""
            onClick={() => setIsModalVisible(true)}
          >
            <PlusIcon
              className={clsx(
                "absolute w-6 h-6 text-gray-500",
                "top-4 right-5 sm:top-[30px] sm:right-[30px]",
              )}
            />
          </div>
        )}
        {recoveryMethods?.map((method) => (
          <RecoveryMethodListItem
            key={`${method.label}-${method.lastUsed}`}
            recoveryMethod={method}
            onRecoveryUpdate={onRecoveryUpdate}
            onRecoveryDelete={onRecoveryDelete}
            onRecoveryProtect={onRecoveryProtect}
            onDeleteRecoveryPhrase={onDeleteRecoveryPhrase}
          />
        ))}
      </ProfileContainer>
      {socialDevices?.length ? (
        <ProfileContainer
          title="Social logins"
          subTitle="Social accounts you can sign in from"
          className="mt-[30px] relative mb-12 sm:mb-0"
        >
          {socialDevices.map((device) => (
            <DeviceListItem
              key={`${device.label}-${device.browser}-${device.lastUsed}`}
              device={device}
              onDeviceUpdate={onDeviceUpdate}
              onDelete={onDeviceDelete}
            />
          ))}
        </ProfileContainer>
      ) : null}
      {walletDevices?.length ? (
        <ProfileContainer
          title="Web3 wallets"
          subTitle="Web3 wallets you can sign in from"
          className="mt-[30px] relative mb-12 sm:mb-0"
        >
          {walletDevices.map((device) => (
            <DeviceListItem
              key={`${device.label}-${device.browser}-${device.lastUsed}`}
              device={device}
              onDeviceUpdate={onDeviceUpdate}
              onDelete={onDeviceDelete}
            />
          ))}
        </ProfileContainer>
      ) : null}
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
                onClick={handleWithLoading(onCreateRecoveryPhrase, (value) =>
                  setPhrase(value),
                )}
                title="Secret recovery phrase"
                id="recovery-key"
                subtitle="A “master password” to keep offline"
                img={<IconRecovery />}
              />
            )}
            {!hasRecoveryPhrase && (
              <MethodRaw
                onClick={handleWithLoading(
                  () => onCreateRecoveryPhrase(false),
                  (value) => setPhrase(value),
                )}
                title="Unprotected recovery phrase"
                subtitle="A “master password” to keep offline"
                img={<IconRecovery />}
                id="create-unprotected-phrase"
                className="absolute w-0 h-0 opacity-0"
              />
            )}
            {!hasSecurityKey && (
              <MethodRaw
                onClick={handleWithLoading(onRegisterRecoveryKey)}
                title="Security key"
                id="security-key"
                subtitle="A USB stick to store a passkey on"
                img={<USBIcon />}
              />
            )}
          </div>
        </ModalAdvanced>
      )}
      {phrase.length ? (
        <AddRecoveryPhraseModal onClose={() => setPhrase("")} phrase={phrase} />
      ) : null}
      <Loader isLoading={isLoading} />
    </ProfileTemplate>
  )
}

export default ProfileSecurityPage
