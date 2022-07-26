import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { P, H3, Logo } from "@internet-identity-labs/nfid-sdk-react"

import { Profile as ProfileT } from "frontend/integration/identity-manager"
import {
  LegacyDevice,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"
import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"
import { ProfileHomeMenu } from "frontend/ui/pages/profile/profile-home-menu"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import { ApplicationList } from "./application-list"
import { DeviceList } from "./device-list/device-list"
import { RecoveryMethodsList } from "./recovery-methods"

interface ProfileProps {
  onDeviceDelete: (device: LegacyDevice) => Promise<void>
  onDeviceUpdate: (device: LegacyDevice) => Promise<void>
  onRecoveryDelete: (method: RecoveryDevice) => Promise<void>
  onRecoveryUpdate: (method: RecoveryDevice) => Promise<void>
  onCreateRecoveryPhrase: () => Promise<void>
  onRegisterRecoveryKey: () => Promise<void>
  devices: LegacyDevice[]
  accounts: NFIDPersona[]
  recoveryMethods: RecoveryDevice[]
  account?: ProfileT
  hasPoa?: boolean
}

export const Profile: React.FC<ProfileProps> = ({
  onDeviceDelete,
  onDeviceUpdate,
  account,
  devices,
  hasPoa,
  accounts = [],
  onRecoveryDelete,
  onRecoveryUpdate,
  onCreateRecoveryPhrase,
  onRegisterRecoveryKey,
  recoveryMethods,
}) => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#a69cff", "#4df1ffa8"],
        bubbleClassNames: [
          "md:top-[40vh] md:left-[10vw]",
          "top-[20vh] left-[27vw] md:top-[60vh] md:left-[10vw]",
        ],
      }}
      navigationItems={
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="md:mt-6">
            <Logo />
          </Link>
          <ProfileHomeMenu className="md:hidden" />
        </div>
      }
      profileScreen
    >
      <main
        className={clsx(
          "container flex flex-col flex-1 relative max-w-6xl w-full",
          "sm:mt-0",
          "md:pl-20 md:ml-auto md:w-2/3",
          "lg:pr-20",
        )}
      >
        <div className={clsx("px-5 md:px-16", "md:bg-white")}>
          <div className="flex items-center justify-between">
            <div>
              <H3 className="block py-2">
                {account?.name ? account.name : account?.anchor}
              </H3>
              <P className={clsx("text-xs")}>NFID number: {account?.anchor}</P>
            </div>

            <ProfileHomeMenu className="hidden md:block" />
          </div>
        </div>
        <ApplicationList accounts={accounts} />
        <DeviceList
          devices={devices}
          onDeviceDelete={onDeviceDelete}
          onDeviceUpdate={onDeviceUpdate}
        />
        <RecoveryMethodsList
          recoveryMethods={recoveryMethods}
          onRecoveryUpdate={onRecoveryUpdate}
          onRecoveryDelete={onRecoveryDelete}
          onCreateRecoveryPhrase={onCreateRecoveryPhrase}
          onRegisterRecoveryKey={onRegisterRecoveryKey}
        />
      </main>
    </AppScreen>
  )
}
