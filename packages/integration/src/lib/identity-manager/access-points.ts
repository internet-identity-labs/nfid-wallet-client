export enum Icon {
  mobile = "mobile",
  tablet = "tablet",
  desktop = "desktop",
  laptop = "laptop",
  document = "document",
  usb = "usb",
  google = "google",
  unknown = "unknown",
  ii = "ii",
  email = "email",
}

export enum DeviceType {
  Email = "Email",
  Google = "Google",
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
