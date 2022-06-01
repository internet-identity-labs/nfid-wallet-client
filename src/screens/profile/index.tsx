import { P, H3, Logo } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { generatePath, Link } from "react-router-dom"

import { PoaBanner } from "frontend/design-system/molecules/poa-banner"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AppScreenProofOfAttendencyConstants } from "frontend/flows/screens-app/proof-of-attendancy/routes"
import { ProfileHomeMenu } from "frontend/screens/profile/profile-home-menu"
import { Device, Icon } from "frontend/services/identity-manager/devices/state"
import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { DeviceData } from "frontend/services/internet-identity/generated/internet_identity_types"

import { ApplicationList } from "./application-list"
import { DeviceList } from "./device-list/device-list"
import { RecoveryMethodsList } from "./recovery-methods"

interface Account {
  anchor: string
  name?: string
}

export interface recoveryMethod extends DeviceData {
  label: string
  isSecurityKey: boolean
  lastUsed: number
  icon: Icon
}

interface ProfileProps {
  onDeviceDelete: (device: Device) => Promise<void>
  onDeviceUpdate: (device: Device) => Promise<void>
  onRecoveryDelete: (method: recoveryMethod) => Promise<void>
  onRecoveryUpdate: (method: recoveryMethod) => Promise<void>
  devices: Device[]
  accounts: NFIDPersona[]
  recoveryMethods: recoveryMethod[]
  account?: Account
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
          <Logo className="md:hidden" />
          <ProfileHomeMenu className="md:hidden" />
        </div>
      }
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
        {hasPoa && (
          <Link
            to={generatePath(
              `${AppScreenProofOfAttendencyConstants.base}/${AppScreenProofOfAttendencyConstants.award}`,
              { secret: "iiw-april-22" },
            )}
            className={clsx(
              "overflow-hidden",
              "sm:px-3 sm:py-6 sm:bg-white md:px-12",
            )}
          >
            <PoaBanner />
          </Link>
        )}
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
        />
        {/* {recoveryPhrase && (
          <RecoveryPhraseSection recoveryPhrase={recoveryPhrase} />
        )} */}
      </main>
    </AppScreen>
  )
}
