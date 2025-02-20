export enum Icon {
  mobile = "mobile",
  tablet = "tablet",
  desktop = "desktop",
  laptop = "laptop",
  document = "document",
  usb = "usb",
  google = "google",
  password = "passord",
  unknown = "unknown",
  ii = "ii",
  email = "email",
  apple = "apple",
  passkey = "passkey"
}

export enum DeviceType {
  Email = "Email",
  Google = "Google",
  Passkey = "Passkey",
  Recovery = "Recovery",
  Password = "Password",
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
  credentialId: string | undefined
}
