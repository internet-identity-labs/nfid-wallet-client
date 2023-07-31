import { Principal } from "@dfinity/principal"
import base64url from "base64url"
import { DeviceData } from "packages/integration/src/lib/_ic_api/internet_identity.d"

import { DeviceType, Icon } from "@nfid/integration"

import { AccessPointResponse } from "frontend/integration/_ic_api/identity_manager.d"

import { IDevice } from "./types"

export const mapIIDevicesToIDevices = (devices: DeviceData[]): IDevice[] => {
  return devices.map((d) => ({
    type:
      "authentication" in d.purpose ? DeviceType.Passkey : DeviceType.Recovery,
    label: d.alias,
    icon: "recovery" in d.purpose ? Icon.document : Icon.unknown,
    created_at: "",
    last_used: "",
    isMultiDevice: false,
    isLegacyDevice: true,
    principal: Principal.selfAuthenticating(new Uint8Array(d.pubkey)).toText(),
    credentialId: d.credential_id[0]
      ? base64url.encode(Buffer.from(d.credential_id[0]))
      : "",
    credentialIdBuffer: d.credential_id[0],
    publickey: d.pubkey,
  }))
}

export const mapIMDevicesToIDevices = (
  devices: AccessPointResponse[],
): IDevice[] => {
  return devices.map((d) => ({
    type:
      d.device === "Recovery phrase"
        ? DeviceType.Recovery
        : (Object.keys(d.device_type)[0] as DeviceType),
    label: d.device,
    icon: d.icon as Icon,
    created_at: "",
    last_used: String(d.last_used),
    isMultiDevice: false,
    isLegacyDevice: false,
    principal: d.principal_id,
    credentialId: d.credential_id[0] ?? "",
  }))
}
