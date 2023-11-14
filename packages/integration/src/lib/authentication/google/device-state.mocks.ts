// import { getPrincipalId } from "../utils"

export const PROFILE = {
  anchor: 12345,
  accessPoints: [
    {
      deviceType: "Unknown",
      icon: "google",
      device: "Google",
      browser: "Chrome with google account",
      principalId:
        "p3npo-xucqz-rmkhi-zu4ew-zwud7-jatgb-mkwtu-al3eq-buxdb-aww7a-cqe",
    },
  ],
  principalId:
    "p3npo-xucqz-rmkhi-zu4ew-zwud7-jatgb-mkwtu-al3eq-buxdb-aww7a-cqe",
  wallet: "II",
  is2fa: false,
  email: "test@identitylabs.ooo",
}

export const DEVICE_DATA = [
  {
    pubkey: new Uint8Array([
      48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0, 15, 151, 231, 222, 35, 180,
      251, 148, 50, 67, 239, 203, 22, 131, 60, 21, 76, 254, 212, 253, 208, 178,
      62, 234, 150, 217, 214, 87, 218, 74, 240, 162,
    ]),
    principalId:
      "p3npo-xucqz-rmkhi-zu4ew-zwud7-jatgb-mkwtu-al3eq-buxdb-aww7a-cqe",
  },
  {
    pubkey: new Uint8Array([
      48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0, 137, 190, 131, 21, 229, 192,
      248, 141, 64, 32, 205, 196, 237, 166, 82, 13, 186, 124, 159, 91, 27, 208,
      153, 222, 232, 213, 183, 197, 177, 120, 228, 207,
    ]),
    principalId:
      "nmyu5-if2hf-urymb-4ajam-34yj3-gjy5d-cogql-pgoe5-iaczc-ml27v-hae",
  },
  {
    pubkey: new Uint8Array([
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 106, 202, 106, 248, 140, 18, 7, 205, 211,
      61, 244, 68, 181, 156, 58, 158, 254, 120, 25, 120, 102, 202, 66, 58, 187,
      153, 119, 75, 199, 153, 194, 222, 34, 88, 32, 25, 170, 41, 174, 135, 194,
      121, 225, 84, 8, 164, 202, 219, 82, 161, 208, 161, 75, 148, 169, 128, 137,
      135, 189, 223, 189, 229, 80, 161, 217, 1, 51,
    ]),
  },
  {
    pubkey: new Uint8Array([
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 254, 22, 85, 75, 176, 179, 184, 202, 17,
      176, 167, 75, 183, 46, 11, 198, 15, 240, 199, 56, 223, 6, 11, 156, 17, 88,
      123, 161, 74, 215, 62, 120, 34, 88, 32, 80, 46, 60, 225, 83, 143, 226,
      130, 180, 139, 240, 230, 112, 204, 120, 112, 91, 59, 212, 25, 171, 182,
      152, 23, 95, 177, 65, 26, 22, 54, 106, 65,
    ]),
  },
]

export const OLD_PROFILE = {
  anchor: 1982367,
  accessPoints: [
    {
      deviceType: "Unknown",
      icon: "",
      device: "NFID Chrome on Mac OS",
      browser: "Chrome",
      principalId:
        "r3gab-jjmuh-s72cd-r5g7n-slnjf-yn5sl-mq2tn-zbsvx-pbjse-owutt-vqe",
    },
  ],
  principalId:
    "tdcpa-2hm6n-vht2t-tb4sx-tmrzk-g4nhc-xs3zv-osr7l-62yef-hedlt-cae",
  wallet: "II",
  is2fa: false,
  email: "test@identitylabs.ooo",
}

const OLD_DEVICE_0 = new Uint8Array([
  48, 42, 48, 5, 6, 3, 43, 101, 112, 3, 33, 0, 15, 163, 177, 144, 247, 77, 111,
  9, 150, 153, 188, 186, 195, 32, 20, 170, 244, 27, 90, 233, 166, 217, 111, 138,
  250, 210, 176, 165, 186, 65, 135, 43,
])

const OLD_DEVICE_1 = new Uint8Array([
  48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165, 1,
  2, 3, 38, 32, 1, 33, 88, 32, 173, 50, 110, 212, 249, 6, 64, 167, 15, 173, 27,
  41, 220, 26, 12, 129, 40, 24, 145, 151, 104, 164, 168, 101, 227, 53, 224, 135,
  21, 169, 238, 141, 34, 88, 32, 212, 56, 0, 167, 173, 31, 103, 101, 30, 237,
  228, 136, 51, 45, 243, 101, 73, 182, 200, 238, 187, 109, 217, 199, 2, 194,
  160, 220, 193, 101, 183, 200,
])

const OLD_DEVICE_2 = new Uint8Array([
  48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165, 1,
  2, 3, 38, 32, 1, 33, 88, 32, 180, 47, 176, 121, 1, 0, 123, 66, 238, 34, 19,
  121, 56, 203, 71, 44, 76, 192, 97, 107, 115, 240, 116, 184, 197, 183, 137, 56,
  62, 156, 35, 67, 34, 88, 32, 207, 241, 252, 230, 109, 48, 156, 129, 68, 189,
  210, 201, 37, 232, 73, 220, 35, 159, 13, 19, 48, 1, 191, 152, 83, 159, 117,
  158, 223, 101, 201, 93,
])

export const OLD_DEVICES = [
  {
    pubkey: OLD_DEVICE_0,
    principalId:
      "tdcpa-2hm6n-vht2t-tb4sx-tmrzk-g4nhc-xs3zv-osr7l-62yef-hedlt-cae",
  },
  {
    pubkey: OLD_DEVICE_1,
    principalId: undefined,
  },
  {
    pubkey: OLD_DEVICE_2,
    // principalId: getPrincipalId(DANS_DEVICE_2 as unknown as Array<number>),
    principalId: undefined,
  },
]
