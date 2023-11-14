import { DelegationIdentity } from "@dfinity/identity"

import { authState } from "../auth-state"

type AccessPoint = {
  device: string
  icon: string
  principalId: string
}

interface GoogleDeviceProfile {
  principalId: string
  accessPoints: AccessPoint[]
}

type Device = { principalId?: string }

type Devices = Device[]

interface GoogleDeviceStateProps {
  profile: GoogleDeviceProfile
  iiDevices: Devices
  activeDevicePrincipalId: string
}

type GoogleDeviceState = {
  isActiveGoogleSession: boolean // Session is authenticated by Google Sign-In
  hasRegisteredWithGoogle: boolean
  hasGoogleDeviceOnII: boolean // Device is available on II
}

export const getGoogleDeviceState = ({
  profile,
  iiDevices,
  activeDevicePrincipalId,
}: GoogleDeviceStateProps): GoogleDeviceState => {
  const registrationDevice = profile.accessPoints.find(
    ({ principalId }) => principalId === profile.principalId,
  )

  const hasRegisteredWithGoogle = registrationDevice?.device === "Google"
  const hasGoogleDeviceOnII =
    hasRegisteredWithGoogle &&
    !!iiDevices.find(
      ({ principalId }) => principalId === registrationDevice?.principalId,
    )

  const isActiveGoogleSession =
    hasRegisteredWithGoogle && activeDevicePrincipalId === profile.principalId

  return {
    isActiveGoogleSession,
    hasGoogleDeviceOnII,
    hasRegisteredWithGoogle,
  }
}
