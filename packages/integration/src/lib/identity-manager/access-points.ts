export type Icon =
  | "mobile"
  | "tablet"
  | "desktop"
  | "laptop"
  | "document"
  | "usb"
  | "google"
  | "unknown"
  | "ii"
  | "metamask"
  | "email"

export enum DeviceType {
  Email = "Email",
  Passkey = "Passkey",
  Recovery = "Recovery",
  Unknown = "Unknown",
}

export interface AccessPointCommon {
  icon: Icon
  device: string
  browser: string
  deviceType: DeviceType
}

export interface AccessPoint extends AccessPointCommon {
  lastUsed: number
  principalId: string
}
