import { AccessPointResponse } from "../_ic_api/identity_manager.d"
import { im } from "../actors"
import { reauthenticationService } from "../authentication/reauthentication.service"
import { hasOwnProperty } from "../test-utils"
import { EmailDeviceNotFoundError } from "./error/email-device-not-found.error"
import { NoSpareAuthMethodError } from "./error/no-spare-auth-method.error"

export * from "./error/email-device-not-found.error"
export * from "./error/no-spare-auth-method.error"

export class EmailDeviceService {
  async hasSpareDevices(): Promise<boolean> {
    const accessPoints = await this.fetchAccessPoints()
    return this.hasSpareAuthMethods(accessPoints)
  }

  async removeEmailDevice(): Promise<void> {
    const accessPoints = await this.fetchAccessPoints()

    const emailAccessPoint = accessPoints.find((accessPoint) =>
      this.isEmailDevice(accessPoint),
    )
    if (!emailAccessPoint) throw new EmailDeviceNotFoundError()

    if (!this.hasSpareAuthMethods(accessPoints))
      throw new NoSpareAuthMethodError()

    await reauthenticationService.reauthenticateWithPasskey(accessPoints)

    const { error, status_code } = await im.remove_access_point({
      pub_key: emailAccessPoint.principal_id,
    })
    if (status_code !== 200) {
      throw new Error(
        `emailDeviceService.removeEmailDevice im.remove_access_point: ${
          error[0] ?? status_code
        }`,
      )
    }
  }

  private async fetchAccessPoints(): Promise<AccessPointResponse[]> {
    const { data, error, status_code } = await im.get_account()
    const account = data[0]
    if (status_code !== 200 || !account) {
      throw new Error(
        `emailDeviceService.fetchAccessPoints im.get_account: ${
          error[0] ?? status_code
        }`,
      )
    }
    return account.access_points
  }

  private hasSpareAuthMethods(accessPoints: AccessPointResponse[]): boolean {
    return (
      accessPoints.some((accessPoint) =>
        this.isNonLegacyPasskey(accessPoint),
      ) &&
      accessPoints.some((accessPoint) => this.isRecoveryPhrase(accessPoint))
    )
  }

  private isNonLegacyPasskey(accessPoint: AccessPointResponse): boolean {
    return (
      hasOwnProperty(accessPoint.device_type, "Passkey") &&
      !!accessPoint.credential_id[0]?.length
    )
  }

  private isRecoveryPhrase(accessPoint: AccessPointResponse): boolean {
    return hasOwnProperty(accessPoint.device_type, "Recovery")
  }

  private isEmailDevice(accessPoint: AccessPointResponse): boolean {
    return hasOwnProperty(accessPoint.device_type, "Email")
  }
}

export const emailDeviceService = new EmailDeviceService()
