export type Icon =
  | "mobile"
  | "tablet"
  | "desktop"
  | "laptop"
  | "document"
  | "usb"
  | "google"
  | "unknown"

export interface AccessPointCommon {
  icon: Icon
  device: string
  browser: string
}

export interface AccessPoint extends AccessPointCommon {
  lastUsed: number
  principalId: string
}
