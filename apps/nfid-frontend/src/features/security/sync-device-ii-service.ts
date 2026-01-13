import { Ed25519KeyIdentity } from "@dfinity/identity"

import { RootWallet, DeviceType, authState, ic } from "@nfid/integration"
import toaster from "@nfid/ui/atoms/toast"

import { securityConnector } from "frontend/features/security/device-connector"
import { fetchProfile } from "frontend/integration/identity-manager"
import {
  fetchAllDevices,
  addDevice,
} from "frontend/integration/internet-identity"

import { mapIIDevicesToIDevices } from "./utils"

export class SyncDeviceIIService {
  async isEmailDeviceOutOfSyncWithII(): Promise<boolean> {
    const profile = await fetchProfile()
    if (profile.wallet === RootWallet.II && profile.email) {
      const emailDevice = profile.accessPoints.find(
        (d) => d.deviceType === DeviceType.Email,
      )

      if (!emailDevice) {
        return false
      }

      const iiDevices = await fetchAllDevices(BigInt(profile?.anchor)).then(
        (devices) => mapIIDevicesToIDevices(devices),
      )

      const { delegationIdentity } = authState.get()
      const isAuthentificatedII = iiDevices.find(
        (device) =>
          device.principal === delegationIdentity?.getPrincipal().toText(),
      )

      if (!isAuthentificatedII) {
        return false
      }

      const isEmailDeviceInII = iiDevices.find(
        (device) => device.principal === emailDevice?.principalId,
      )
      return !isEmailDeviceInII
    }

    return false
  }

  async syncEmailDeviceWithII() {
    const profile = await fetchProfile()
    const imDevices = await securityConnector.getIMDevices()
    const emailImDevice = imDevices.find((d) => d.type === DeviceType.Email)

    if (!emailImDevice) {
      const errorMessage = "The email device is not found."
      toaster.error(errorMessage)
      throw Error(errorMessage)
    }

    const url = ic.isLocal ? "/publickey" : AWS_PUBLIC_KEY
    const publicKeyResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: profile.email,
        principal: emailImDevice.principal,
      }),
    })
    const { publicKey } = await publicKeyResponse.json()
    const identity = Ed25519KeyIdentity.fromParsedJson([publicKey, "0"])

    await addDevice(
      BigInt(profile.anchor),
      "Email",
      { cross_platform: null },
      { authentication: null },
      identity.getPublicKey().toDer(),
    )

    toaster.success("The email device has been synchronized.")
  }
}

export const syncDeviceIIService = new SyncDeviceIIService()
