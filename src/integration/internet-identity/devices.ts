import { ii } from "frontend/comm/actors"
import { UserNumber } from "frontend/comm/idl/internet_identity_types"
import { hasOwnProperty } from "frontend/comm/services/internet-identity/utils"

export async function fetchAllDevices(anchor: UserNumber) {
  return await ii.lookup(anchor)
}

export async function fetchRecoveryDevices(anchor: UserNumber) {
  const allDevices = await ii.lookup(anchor)
  return allDevices.filter((device) =>
    hasOwnProperty(device.purpose, "recovery"),
  )
}
