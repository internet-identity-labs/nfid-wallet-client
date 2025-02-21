import React from "react"

import {
  DeviceType,
  Icon,
  authState,
  getGoogleDeviceState,
} from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { fetchAllDevices } from "frontend/integration/internet-identity"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"

type AccessPoint = {
  device: string
  deviceType: DeviceType
  icon: string
  principalId: string
}

type PrimarySignInMethodProps = {
  profile: {
    name?: string
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

  if (profile?.email)
    return (
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
    )

  if (
    profile.name &&
    profile.accessPoints.find((p) => p.deviceType === DeviceType.Passkey)
  ) {
    return (
      <div className="flex space-x-2.5 items-center">
        <div className="w-10 h-10 p-2 rounded-full">
          <DeviceIconDecider icon={Icon.passkey} />
        </div>
        <div>
          <p className="text-sm leading-[23px]">{profile.name}</p>
          <p className="text-xs leading-5 text-gray-400">Passkey sign in</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex space-x-2.5 items-center">
      <div className="w-10 h-10 p-2 rounded-full">
        <DeviceIconDecider icon={Icon.document} />
      </div>
      <div>
        <p className="text-sm leading-[23px]">No NFID Wallet name set</p>
        <p className="text-xs leading-5 text-gray-400">
          Recovery phrase sign in
        </p>
      </div>
    </div>
  )
}
