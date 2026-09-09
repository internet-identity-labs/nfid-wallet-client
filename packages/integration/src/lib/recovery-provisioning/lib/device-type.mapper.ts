import { AccessPointResponse } from "../../_ic_api/identity_manager.d"
import { DeviceType } from "../../identity-manager/access-points"
import { hasOwnProperty } from "../../test-utils"

export const deviceTypeMapper = {
  toDeviceTypes(accessPoints: AccessPointResponse[]): DeviceType[] {
    return accessPoints.flatMap((accessPoint) => {
      if (hasOwnProperty(accessPoint.device_type, "Passkey")) {
        return [DeviceType.Passkey]
      }
      if (hasOwnProperty(accessPoint.device_type, "Recovery")) {
        return [DeviceType.Recovery]
      }
      return []
    })
  },
}
