import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import {
  LegacyDevice,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"

import Index from "."

export default {
  title: "Screens/NewProfile/Security",
  component: Index,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Index>

const Template: ComponentStory<typeof Index> = (args) => {
  return (
    <Router>
      <Index {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  onDeviceDelete: (device: LegacyDevice) => Promise.resolve(),
  onDeviceUpdate: (device: LegacyDevice) => Promise.resolve(),
  onDeviceUpdateLabel: (device: LegacyDevice) => Promise.resolve(),
  onRecoveryUpdate: (device: RecoveryDevice) => Promise.resolve(),
  onRecoveryDelete: (device: RecoveryDevice) => Promise.resolve(),
  onCreateRecoveryPhrase: () => Promise.resolve("phrase"),
  onRegisterRecoveryKey: () => Promise.resolve(),
  devices: [
    {
      label: "NFID Safari on iOS",
      icon: "mobile",
      browser: "Chrome",
      lastUsed: Date.now(),
      pubkey: [
        48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0,
        165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 29, 87, 106, 190, 28, 84, 72, 21,
        114, 212, 197, 213, 226, 247, 65, 93, 96, 14, 77, 220, 194, 6, 141, 132,
        33, 161, 209, 30, 225, 229, 235, 5, 34, 88, 32, 151, 83, 89, 66, 106,
        253, 8, 101, 83, 178, 40, 26, 144, 250, 167, 147, 198, 98, 172, 250,
        249, 102, 63, 98, 11, 158, 38, 120, 210, 78, 170, 141,
      ],
      key_type: { unknown: null },
      purpose: { authentication: null },
      credential_id: [
        [
          35, 186, 164, 34, 5, 38, 220, 148, 94, 156, 248, 99, 18, 201, 180, 63,
          107, 150, 162, 231,
        ],
      ],
    },
    {
      label: "NFID Chrome on Mac OS",
      browser: "Chrome",
      icon: "desktop",
      lastUsed: Date.now(),
      pubkey: [
        48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0,
        165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 28, 236, 31, 91, 120, 30, 4, 110,
        101, 241, 15, 67, 219, 220, 126, 99, 177, 140, 61, 77, 140, 178, 200,
        145, 242, 132, 198, 110, 86, 225, 117, 53, 34, 88, 32, 75, 43, 133, 44,
        120, 209, 167, 173, 106, 113, 182, 185, 11, 31, 33, 39, 28, 90, 49, 71,
        59, 114, 222, 191, 21, 166, 233, 233, 49, 76, 49, 94,
      ],
      key_type: { unknown: null },
      purpose: { authentication: null },
      credential_id: [
        [
          156, 184, 209, 152, 79, 79, 249, 184, 91, 208, 247, 174, 93, 24, 83,
          174, 32, 242, 111, 63, 39, 161, 63, 123, 5, 56, 30, 161, 48, 84, 151,
          254, 154, 45, 186, 199, 53, 79, 54, 29, 61, 70, 201, 145, 52, 224,
          173, 104, 188, 17, 139, 150, 48, 143, 104, 74, 95, 77, 84, 33, 53,
          246, 211, 99, 140, 151, 37, 4, 75, 57, 183, 236, 219, 46, 185, 142,
          33, 118, 114, 42, 226, 171, 132,
        ],
      ],
    },
  ],
  recoveryMethods: [
    {
      label: "Security Key",
      lastUsed: Date.now(),
      pubkey: [
        48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0,
        165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 29, 87, 106, 190, 28, 84, 72, 21,
        114, 212, 197, 213, 226, 247, 65, 93, 96, 14, 77, 220, 194, 6, 141, 132,
        33, 161, 209, 30, 225, 229, 235, 5, 34, 88, 32, 151, 83, 89, 66, 106,
        253, 8, 101, 83, 178, 40, 26, 144, 250, 167, 147, 198, 98, 172, 250,
        249, 102, 63, 98, 11, 158, 38, 120, 210, 78, 170, 141,
      ],
      key_type: { unknown: null },
      purpose: { authentication: null },
      credential_id: [
        [
          35, 186, 164, 34, 5, 38, 220, 148, 94, 156, 248, 99, 18, 201, 180, 63,
          107, 150, 162, 231,
        ],
      ],
      isSecurityKey: true,
      isRecoveryPhrase: false,
      alias: "GDSFGDSFSD FDSFDSF",
      icon: "usb",
    },
    {
      label: "Recovery phrase",
      lastUsed: Date.now(),
      pubkey: [
        48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0,
        165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 29, 87, 106, 190, 28, 84, 72, 21,
        114, 212, 197, 213, 226, 247, 65, 93, 96, 14, 77, 220, 194, 6, 141, 132,
        33, 161, 209, 30, 225, 229, 235, 5, 34, 88, 32, 151, 83, 89, 66, 106,
        253, 8, 101, 83, 178, 40, 26, 144, 250, 167, 147, 198, 98, 172, 250,
        249, 102, 63, 98, 11, 158, 38, 120, 210, 78, 170, 141,
      ],
      key_type: { unknown: null },
      purpose: { authentication: null },
      credential_id: [
        [
          35, 186, 164, 34, 5, 38, 220, 148, 94, 156, 248, 99, 18, 201, 180, 63,
          107, 150, 162, 231,
        ],
      ],
      isSecurityKey: false,
      isRecoveryPhrase: true,
      alias: "GDSFGDSFSD FDSFDSF",
      icon: "document",
    },
  ],
  socialDevices: [
    {
      label: "Google",
      icon: "google",
      browser: "Chrome",
      lastUsed: Date.now(),
      isAccessPoint: true,
      isSocialDevice: true,
      pubkey: [
        48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0,
        165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 29, 87, 106, 190, 28, 84, 72, 21,
        114, 212, 197, 213, 226, 247, 65, 93, 96, 14, 77, 220, 194, 6, 141, 132,
        33, 161, 209, 30, 225, 229, 235, 5, 34, 88, 32, 151, 83, 89, 66, 106,
        253, 8, 101, 83, 178, 40, 26, 144, 250, 167, 147, 198, 98, 172, 250,
        249, 102, 63, 98, 11, 158, 38, 120, 210, 78, 170, 141,
      ],
      key_type: { unknown: null },
      purpose: { authentication: null },
      credential_id: [
        [
          35, 186, 164, 34, 5, 38, 220, 148, 94, 156, 248, 99, 18, 201, 180, 63,
          107, 150, 162, 231,
        ],
      ],
    },
  ],
}
