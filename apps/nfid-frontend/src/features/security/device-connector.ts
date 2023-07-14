import { format } from "date-fns"

import {
  DeviceType,
  LambdaPasskeyDecoded,
  getPasskey,
  im,
} from "@nfid/integration"

import { isPasskeyDevice, isRecoveryDevice } from "./helpers"
import { IDevice, IGroupedDevices } from "./types"

export class SecurityConnector {
  async getIMDevices(): Promise<IGroupedDevices> {
    const { data: imDevices } = await im.read_access_points()

    if (!imDevices.length)
      throw new Error("Unable to fetch im.get_access_points")

    const allCredentials: string[] = imDevices[0]
      .map((d) => d.credential_id.join(""))
      .filter((d) => d.length)

    const passkeysMetadata: LambdaPasskeyDecoded[] = allCredentials.length
      ? (await getPasskey(allCredentials)).map((p) => ({
          key: p.key,
          data: JSON.parse(p.data),
        }))
      : []

    const allDevices = imDevices[0].map((device) => {
      const passkeyMetadata = passkeysMetadata.find(
        (p) => p.key === device.credential_id[0],
      )

      return {
        label: device.device,
        icon: device.icon,
        isLegacyDevice: !passkeyMetadata,
        isMultiDevice: !!passkeyMetadata?.data?.flags.backupEligibility,
        created_at: passkeyMetadata?.data?.created_at
          ? format(new Date(passkeyMetadata?.data?.created_at), "MMM dd, yyyy")
          : "",
        last_used: device?.last_used
          ? format(
              new Date(Number(BigInt(device?.last_used) / BigInt(1000000))),
              "MMM dd, yyyy",
            )
          : "",
        type: Object.keys(device.device_type)[0],
        principal: device.principal_id,
      } as IDevice
    })

    return {
      recoveryDevice: allDevices.find(isRecoveryDevice),
      passkeys: allDevices.filter(isPasskeyDevice),
      emailDevice: allDevices.find((d) => d.type === DeviceType.Email),
    }
  }
}

export const securityConnector = new SecurityConnector()
