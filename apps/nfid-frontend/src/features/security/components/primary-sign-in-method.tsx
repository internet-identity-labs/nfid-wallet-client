import clsx from "clsx"
import React from "react"
import useSWR from "swr"

import { IconCmpPlus } from "@nfid-frontend/ui"
import { Icon, authState, getGoogleDeviceState } from "@nfid/integration"

import { fetchAllDevices } from "frontend/integration/internet-identity"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"

type AccessPoint = {
  device: string
  icon: string
  principalId: string
}

type PrimarySignInMethodProps = {
  profile: {
    anchor: number
    email?: string
    principalId: string
    accessPoints: AccessPoint[]
  }
}
export const PrimarySignInMethod: React.FC<PrimarySignInMethodProps> = ({
  profile,
}) => {
  const activeDevicePrincipalId = authState.get().activeDevicePrincipalId
  const { data: iiDevices } = useSWR(
    [profile.anchor, "iiDevices"],
    ([anchor]) => fetchAllDevices(BigInt(anchor)),
  )

  const googleState = React.useMemo(() => {
    if (!iiDevices || !activeDevicePrincipalId) return null
    return getGoogleDeviceState({
      profile,
      iiDevices,
      activeDevicePrincipalId,
    })
  }, [activeDevicePrincipalId, iiDevices, profile])

  const isGoogleUser = !!googleState?.hasRegisteredWithGoogle

  return profile?.email ? (
    <div className="flex space-x-2.5 items-center">
      <div className="w-10 h-10 p-2 rounded-full">
        <DeviceIconDecider icon={isGoogleUser ? Icon.google : Icon.email} />
      </div>
      <div>
        <p className="text-sm leading-[23px]">{profile.email}</p>
        <p className="text-xs leading-5 text-gray-400">
          {isGoogleUser ? "Google" : "Email"} sign in
        </p>
      </div>
    </div>
  ) : (
    <div
      className={clsx(
        "flex items-center space-x-2.5 pl-2.5 h-[61px] text-blue",
        "hover:opacity-50 cursor-pointer transition-opacity",
        "pointer-events-none !text-gray-400 cursor-not-allowed",
      )}
    >
      <IconCmpPlus className="w-[18px] h-[18px]" />
      <span className="text-sm font-bold">Add an email</span>
    </div>
  )
}
