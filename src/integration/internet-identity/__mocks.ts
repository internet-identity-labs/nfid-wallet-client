import { CredentialId } from "../_ic_api/internet_identity_types"

export const NFID_SIGNED_DELEGATION = {
  chain: {
    delegations: [
      {
        delegation: {
          expiration: "170113e856a44600",
          pubkey:
            "302a300506032b657003210081eee8e3bb6e18aaa3b1b6b5c1741adde1d89219e55bc41a25876dc00854c64b",
          targets: [
            "00000000012018ED0101",
            "00000000014000800101",
            "0000000000D0006E0101",
            "0000000001C0006C0101",
            "00000000015002820101",
          ],
        },
        signature:
          "d9d9f7a3697369676e61747572655847304502201c2a7a8a27290226e1b3ee3e6b438f28698bc047689483d2e79c56ddbb1839d1022100a1ac6e42f9ded9056bd419ae04a04f00b32874e015473da02955229c9c6a075370636c69656e745f646174615f6a736f6e78b07b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22476d6c6a4c584a6c6358566c63335174595856306143316b5a57786c5a3246306157397549767233324b6f4d6b6f415f656c41746f6454367734644c735062476c324252784678665f447331626959222c226f726967696e223a2268747470733a2f2f7068696c6970702e65752e6e67726f6b2e696f222c2263726f73734f726967696e223a66616c73657d7261757468656e74696361746f725f64617461582594cca80c8dac188ccfc5fc2db951b8a04ae009b0dd5789a958ca0715fc753f430500000000",
      },
    ],
    publicKey:
      "305e300c060a2b0601040183b8430101034e00a5010203262001215820e1a851cd997190bcc7b42842c15c3f7fe62462fc7b7d9d11aaf718019ef0eeac225820558faee7b1908bb148fb9e7e775539f9d684b04223e4a06eccf5735f60fc9f08",
  },
  sessionKey: [
    "302a300506032b657003210081eee8e3bb6e18aaa3b1b6b5c1741adde1d89219e55bc41a25876dc00854c64b",
    "524c11ca3d21784a2602861f650a5b049d1316f2d31dcc1c0fc258022dda134f81eee8e3bb6e18aaa3b1b6b5c1741adde1d89219e55bc41a25876dc00854c64b",
  ],
}

export const JSON_SERIALISABLE_SIGNED_DELEGATION = {
  delegation: {
    pubkey: [
      9, 111, 158, 228, 241, 50, 15, 74, 216, 248, 252, 2, 93, 196, 205, 217,
      152, 146,
    ],
    expiration: "1657629242918823400",
  },
  signature: [
    217, 217, 247, 162, 107, 99, 101, 114, 116, 105, 102, 105, 99, 97, 116, 101,
    89, 6, 96, 217, 217, 247, 163, 100, 116, 114, 101, 101, 131, 1, 131, 1, 131,
    1, 131, 2, 72, 99, 97, 110, 105, 115, 116, 101, 114, 131, 1, 131, 1, 131, 1,
    130, 4, 88, 32, 42, 134, 187, 112, 176, 2, 150, 157, 193, 62, 228, 83, 133,
    119, 57, 183, 189, 90, 225, 136, 170, 96, 118, 172, 178, 54, 70, 255, 28,
    22, 13, 164, 131, 1, 130, 4, 88, 32, 172, 59, 210, 184, 116, 27, 220, 203,
    253, 97, 168, 127, 76, 182, 11, 69, 124, 189, 177, 6, 53, 5, 104, 145, 232,
    79, 221, 178, 145, 9, 71, 242, 131, 1, 131, 1, 131, 1, 131, 1, 131, 1, 130,
    4, 88, 32, 124, 184, 250, 69, 187, 111, 226, 155, 0, 142, 94, 55, 74, 203,
    184, 68, 120, 149, 107, 171, 65, 211, 225, 247, 152, 159, 231, 126, 179,
    118, 44, 218, 131, 1, 130, 4, 88, 32, 146, 3, 244, 90, 235, 181, 161, 95,
    183, 38, 161, 66, 69, 165, 238, 140, 133, 71, 18, 79, 73, 165, 193, 252,
    185, 166, 93, 182, 52, 250, 103, 36, 131, 1, 130, 4, 88, 32, 122, 198, 129,
    216, 32, 146, 140, 168, 44, 51, 223, 73, 154, 108, 58, 58, 226, 44, 100,
    185, 110, 196, 0, 31, 3, 111, 92, 211, 133, 42, 242, 160, 131, 1, 131, 1,
    130, 4, 88, 32, 23, 209, 205, 188, 218, 241, 159, 75, 140, 86, 250, 26, 216,
    49, 41, 175, 32, 77, 243, 144, 12, 70, 28, 85, 113, 30, 226, 39, 173, 84,
    239, 111, 131, 1, 130, 4, 88, 32, 64, 205, 87, 72, 94, 58, 137, 143, 169,
    68, 149, 163, 63, 124, 118, 224, 130, 149, 32, 244, 86, 11, 253, 45, 49,
    163, 71, 231, 126, 24, 84, 161, 131, 1, 130, 4, 88, 32, 10, 169, 251, 60,
    36, 196, 185, 132, 208, 191, 137, 28, 218, 230, 243, 245, 49, 88, 58, 157,
    2, 117, 187, 124, 208, 36, 198, 111, 236, 108, 241, 154, 131, 2, 74, 0, 0,
    0, 0, 1, 32, 24, 237, 1, 1, 131, 1, 131, 1, 131, 1, 131, 2, 78, 99, 101,
    114, 116, 105, 102, 105, 101, 100, 95, 100, 97, 116, 97, 130, 3, 88, 32,
    105, 145, 8, 21, 164, 79, 27, 203, 228, 230, 152, 43, 191, 224, 221, 118,
    188, 198, 235, 253, 223, 237, 130, 58, 217, 97, 110, 177, 148, 194, 141,
    126, 130, 4, 88, 32, 131, 197, 107, 241, 77, 222, 61, 40, 222, 102, 198,
    146, 181, 252, 157, 151, 233, 221, 152, 91, 106, 215, 43, 15, 230, 248, 78,
    138, 141, 243, 220, 178, 130, 4, 88, 32, 177, 112, 143, 189, 165, 252, 172,
    47, 73, 16, 128, 2, 138, 7, 163, 170, 241, 194, 208, 202, 253, 180, 180,
    242, 184, 180, 157, 152, 50, 155, 76, 61, 130, 4, 88, 32, 208, 47, 67, 58,
    213, 213, 190, 94, 192, 9, 205, 82, 158, 73, 188, 141, 82, 54, 86, 206, 142,
    139, 57, 182, 60, 7, 78, 174, 255, 244, 37, 26, 130, 4, 88, 32, 150, 99,
    100, 166, 114, 45, 95, 112, 79, 169, 172, 164, 216, 186, 167, 207, 255, 232,
    199, 236, 114, 216, 93, 180, 90, 197, 233, 199, 189, 173, 112, 37, 130, 4,
    88, 32, 184, 230, 22, 91, 153, 250, 57, 212, 16, 80, 71, 37, 83, 44, 34,
    100, 227, 122, 108, 232, 165, 149, 107, 255, 111, 95, 22, 98, 77, 15, 235,
    6, 130, 4, 88, 32, 12, 89, 157, 183, 87, 219, 30, 227, 20, 113, 163, 48, 86,
    134, 198, 241, 230, 238, 108, 92, 135, 9, 164, 59, 59, 161, 146, 128, 174,
    221, 161, 46, 130, 4, 88, 32, 22, 28, 132, 43, 54, 102, 228, 240, 94, 134,
    219, 174, 110, 109, 19, 77, 154, 66, 161, 157, 140, 106, 241, 86, 197, 126,
    228, 165, 6, 9, 234, 126, 130, 4, 88, 32, 153, 213, 143, 45, 239, 104, 14,
    25, 92, 188, 161, 11, 251, 179, 135, 7, 101, 254, 50, 172, 127, 77, 237, 2,
    217, 221, 41, 101, 234, 248, 251, 164, 130, 4, 88, 32, 185, 113, 12, 224,
    45, 191, 93, 175, 88, 145, 175, 87, 216, 47, 234, 175, 49, 111, 111, 170,
    140, 164, 246, 55, 97, 97, 227, 108, 95, 22, 87, 252, 130, 4, 88, 32, 98,
    209, 81, 142, 46, 204, 205, 51, 131, 93, 108, 64, 81, 164, 155, 98, 204,
    200, 89, 53, 167, 29, 254, 69, 240, 182, 227, 141, 170, 18, 109, 9, 130, 4,
    88, 32, 202, 27, 146, 19, 29, 129, 15, 217, 109, 253, 75, 75, 119, 63, 204,
    73, 113, 83, 164, 101, 62, 30, 81, 182, 208, 158, 39, 22, 230, 49, 200, 34,
    130, 4, 88, 32, 103, 76, 102, 93, 218, 78, 78, 154, 86, 132, 197, 25, 184,
    146, 159, 8, 46, 168, 243, 165, 13, 29, 138, 157, 41, 157, 147, 50, 64, 225,
    134, 34, 131, 1, 130, 4, 88, 32, 78, 11, 10, 239, 73, 169, 34, 202, 249, 57,
    141, 154, 240, 90, 164, 197, 172, 242, 84, 252, 46, 0, 98, 149, 76, 77, 105,
    200, 124, 57, 145, 211, 131, 2, 68, 116, 105, 109, 101, 130, 3, 73, 196,
    164, 217, 200, 141, 236, 196, 128, 23, 105, 115, 105, 103, 110, 97, 116,
    117, 114, 101, 88, 48, 137, 75, 186, 201, 202, 40, 236, 31, 21, 16, 119, 2,
    48, 68, 91, 173, 124, 236, 44, 52, 66, 3, 192, 91, 192, 121, 130, 132, 146,
    197, 229, 211, 43, 165, 137, 96, 166, 186, 4, 5, 68, 50, 239, 130, 41, 132,
    164, 8, 106, 100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 162, 105, 115,
    117, 98, 110, 101, 116, 95, 105, 100, 88, 29, 92, 118, 179, 152, 142, 215,
    136, 171, 195, 45, 46, 161, 51, 49, 188, 41, 222, 188, 79, 36, 209, 154,
    143, 65, 65, 126, 174, 177, 2, 107, 99, 101, 114, 116, 105, 102, 105, 99,
    97, 116, 101, 89, 2, 87, 217, 217, 247, 162, 100, 116, 114, 101, 101, 131,
    1, 130, 4, 88, 32, 111, 142, 188, 222, 63, 148, 117, 180, 242, 30, 175, 100,
    167, 86, 232, 65, 196, 154, 135, 38, 72, 15, 25, 189, 19, 231, 230, 156,
    138, 63, 253, 236, 131, 1, 131, 2, 70, 115, 117, 98, 110, 101, 116, 131, 1,
    131, 1, 130, 4, 88, 32, 172, 38, 44, 156, 189, 157, 132, 142, 142, 182, 131,
    75, 99, 82, 232, 82, 240, 69, 209, 238, 120, 15, 39, 108, 57, 165, 22, 127,
    92, 137, 131, 178, 131, 1, 131, 1, 131, 1, 131, 1, 131, 2, 88, 29, 92, 118,
    179, 152, 142, 215, 136, 171, 195, 45, 46, 161, 51, 49, 188, 41, 222, 188,
    79, 36, 209, 154, 143, 65, 65, 126, 174, 177, 2, 131, 1, 131, 2, 79, 99, 97,
    110, 105, 115, 116, 101, 114, 95, 114, 97, 110, 103, 101, 115, 130, 3, 88,
    27, 217, 217, 247, 129, 130, 74, 0, 0, 0, 0, 1, 32, 0, 0, 1, 1, 74, 0, 0, 0,
    0, 1, 47, 255, 255, 1, 1, 131, 2, 74, 112, 117, 98, 108, 105, 99, 95, 107,
    101, 121, 130, 3, 88, 133, 48, 129, 130, 48, 29, 6, 13, 43, 6, 1, 4, 1, 130,
    220, 124, 5, 3, 1, 2, 1, 6, 12, 43, 6, 1, 4, 1, 130, 220, 124, 5, 3, 2, 1,
    3, 97, 0, 174, 4, 176, 181, 59, 79, 98, 206, 74, 120, 154, 107, 15, 12, 158,
    102, 223, 165, 134, 140, 178, 243, 224, 231, 246, 40, 202, 111, 185, 62, 79,
    51, 135, 154, 143, 228, 122, 35, 72, 95, 48, 245, 166, 132, 114, 196, 253,
    70, 11, 194, 153, 35, 184, 81, 2, 55, 146, 67, 122, 243, 204, 105, 8, 145,
    116, 10, 103, 111, 251, 235, 141, 131, 110, 110, 213, 178, 64, 157, 203, 50,
    16, 77, 222, 149, 103, 67, 229, 29, 59, 14, 35, 34, 42, 201, 72, 123, 130,
    4, 88, 32, 30, 63, 184, 196, 88, 111, 200, 105, 241, 142, 193, 124, 121, 31,
    160, 243, 25, 103, 240, 236, 221, 182, 64, 58, 6, 6, 236, 26, 206, 222, 83,
    41, 130, 4, 88, 32, 77, 95, 87, 153, 154, 76, 44, 89, 57, 143, 89, 142, 146,
    230, 164, 228, 98, 61, 57, 125, 253, 156, 100, 214, 239, 49, 101, 82, 203,
    174, 84, 248, 130, 4, 88, 32, 39, 20, 12, 122, 249, 26, 42, 93, 44, 82, 168,
    43, 145, 171, 164, 17, 94, 7, 210, 85, 240, 149, 231, 128, 232, 154, 255,
    114, 127, 154, 161, 191, 130, 4, 88, 32, 79, 158, 237, 218, 49, 18, 213, 58,
    237, 133, 227, 186, 148, 28, 12, 32, 180, 105, 85, 176, 203, 83, 0, 61, 160,
    178, 228, 211, 148, 101, 113, 187, 130, 4, 88, 32, 45, 133, 107, 186, 123,
    108, 128, 23, 28, 232, 229, 209, 33, 187, 126, 68, 80, 179, 86, 90, 100, 77,
    145, 53, 233, 254, 88, 132, 40, 28, 31, 185, 131, 2, 68, 116, 105, 109, 101,
    130, 3, 73, 252, 142, 253, 236, 200, 149, 177, 128, 23, 105, 115, 105, 103,
    110, 97, 116, 117, 114, 101, 88, 48, 181, 131, 69, 140, 239, 76, 32, 61,
    139, 176, 125, 179, 51, 163, 124, 137, 1, 88, 149, 201, 232, 140, 248, 146,
    65, 221, 228, 126, 221, 155, 244, 222, 45, 249, 229, 196, 18, 234, 76, 69,
    133, 108, 154, 42, 30, 122, 7, 74, 100, 116, 114, 101, 101, 131, 1, 130, 4,
    88, 32, 153, 2, 233, 105, 15, 141, 88, 32, 127, 37, 64, 112, 116, 143, 20,
    230, 164, 239, 199, 40, 117, 238, 166, 0, 249, 204, 147, 10, 202, 87, 225,
    72, 131, 2, 67, 115, 105, 103, 131, 2, 88, 32, 222, 125, 239, 237, 92, 195,
    178, 156, 35, 224, 236, 144, 204, 220, 7, 199, 127, 23, 247, 55, 7, 137, 19,
    144, 26, 54, 246, 109, 97, 220, 155, 222, 131, 2, 88, 32, 69, 229, 118, 146,
    228, 196, 253, 205, 8, 194, 71, 252, 242, 172, 195, 191, 210, 54, 14, 117,
    8, 197, 181, 96, 201, 140, 36, 75, 166, 164, 44, 153, 130, 3, 64,
  ],
  userKey: [
    48, 60, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 2, 3, 44, 0, 10, 0,
    0, 0, 0, 1, 32, 24, 237, 1, 1, 159, 7, 243, 215, 78, 82, 248, 167, 113, 44,
    82, 77, 105, 208, 62, 179, 243, 3, 59, 207, 118, 222, 55, 51, 252, 133, 159,
    50, 11, 199, 158, 138,
  ],
}

export const II_DEVICES_DATA = [
  {
    alias: "NFID Safari on iOS",
    protection: {
      unprotected: null,
    },
    pubkey: [
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 55, 61, 164, 96, 188, 34, 47, 222, 221,
      46, 132, 45, 64, 156, 73, 137, 151, 138, 109, 201, 58, 104, 157, 84, 214,
      19, 230, 233, 120, 240, 22, 155, 34, 88, 32, 180, 68, 214, 140, 92, 193,
      209, 245, 195, 60, 41, 113, 158, 19, 59, 52, 53, 55, 27, 32, 194, 215,
      251, 255, 85, 235, 224, 5, 196, 41, 71, 188,
    ],
    key_type: {
      unknown: null,
    },
    purpose: {
      authentication: null,
    },
    credential_id: [
      [
        131, 84, 120, 48, 98, 178, 173, 10, 16, 175, 102, 122, 247, 163, 82,
        204, 200, 46, 103, 246,
      ],
    ] as [CredentialId],
  },
  {
    alias: "NFID Chrome on Mac OS",
    protection: {
      unprotected: null,
    },
    pubkey: [
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 96, 47, 148, 64, 3, 82, 49, 77, 244, 88,
      19, 214, 225, 128, 7, 97, 1, 78, 133, 177, 41, 154, 187, 80, 18, 96, 55,
      180, 172, 75, 69, 139, 34, 88, 32, 100, 172, 107, 197, 30, 49, 225, 25,
      177, 10, 188, 171, 23, 6, 179, 189, 158, 48, 230, 49, 82, 102, 103, 226,
      232, 21, 121, 119, 194, 238, 199, 34,
    ],
    key_type: {
      unknown: null,
    },
    purpose: {
      authentication: null,
    },
    credential_id: [
      [
        115, 240, 4, 179, 14, 130, 153, 0, 217, 142, 105, 62, 60, 42, 173, 123,
        46, 114, 181, 195, 195, 198, 214, 26, 168, 166, 69, 157, 50, 60, 64, 3,
        56, 254, 97, 31, 112, 142, 26, 196, 99, 228, 24, 255, 74, 25, 225, 217,
        100, 114, 234, 193, 229, 204, 87, 156, 211, 232, 222, 126, 208, 246, 7,
        35, 168, 27, 25, 103, 236, 162, 122, 46, 180, 9, 55, 197, 158, 78, 166,
        235, 211, 103, 135,
      ],
    ] as [CredentialId],
  },
]

export const AUTHENTICATOR_DEVICES = [
  {
    alias: "NFID Safari on iOS",
    protected: false,
    pubkey: [
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 55, 61, 164, 96, 188, 34, 47, 222, 221,
      46, 132, 45, 64, 156, 73, 137, 151, 138, 109, 201, 58, 104, 157, 84, 214,
      19, 230, 233, 120, 240, 22, 155, 34, 88, 32, 180, 68, 214, 140, 92, 193,
      209, 245, 195, 60, 41, 113, 158, 19, 59, 52, 53, 55, 27, 32, 194, 215,
      251, 255, 85, 235, 224, 5, 196, 41, 71, 188,
    ],
    keyType: "unknown",
    purpose: "authentication",
    credentialId: [
      131, 84, 120, 48, 98, 178, 173, 10, 16, 175, 102, 122, 247, 163, 82, 204,
      200, 46, 103, 246,
    ],
  },
  {
    alias: "NFID Chrome on Mac OS",
    protected: false,
    pubkey: [
      48, 94, 48, 12, 6, 10, 43, 6, 1, 4, 1, 131, 184, 67, 1, 1, 3, 78, 0, 165,
      1, 2, 3, 38, 32, 1, 33, 88, 32, 96, 47, 148, 64, 3, 82, 49, 77, 244, 88,
      19, 214, 225, 128, 7, 97, 1, 78, 133, 177, 41, 154, 187, 80, 18, 96, 55,
      180, 172, 75, 69, 139, 34, 88, 32, 100, 172, 107, 197, 30, 49, 225, 25,
      177, 10, 188, 171, 23, 6, 179, 189, 158, 48, 230, 49, 82, 102, 103, 226,
      232, 21, 121, 119, 194, 238, 199, 34,
    ],
    keyType: "unknown",
    purpose: "authentication",
    credentialId: [
      115, 240, 4, 179, 14, 130, 153, 0, 217, 142, 105, 62, 60, 42, 173, 123,
      46, 114, 181, 195, 195, 198, 214, 26, 168, 166, 69, 157, 50, 60, 64, 3,
      56, 254, 97, 31, 112, 142, 26, 196, 99, 228, 24, 255, 74, 25, 225, 217,
      100, 114, 234, 193, 229, 204, 87, 156, 211, 232, 222, 126, 208, 246, 7,
      35, 168, 27, 25, 103, 236, 162, 122, 46, 180, 9, 55, 197, 158, 78, 166,
      235, 211, 103, 135,
    ],
  },
]

export const TRANSACTION_HISTORY =
  '{"totalCount":1,"transactions":[{"blockIdentifier":{"index":4270638,"hash":"dc1a65ddb41e1db85079c2a3c9fe0ebd3f9aa41f6fc3a75d02fcb194879973be"},"transaction":{"metadata":{"blockHeight":4270638,"memo":0,"timestamp":1660559325695288000},"transactionIdentifier":{"hash":"df8e6642f8df97859bf217f693e2a96b9623b3237269d9dcfb316ce67306cd60"},"operations":[{"operationIdentifier":{"index":0},"type":"TRANSACTION","status":"COMPLETED","account":{"address":"d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06"},"amount":{"currency":{"symbol":"ICP","decimals":8},"value":"-0.0001"}},{"operationIdentifier":{"index":1},"type":"TRANSACTION","status":"COMPLETED","account":{"address":"ad19832ac19044e892262b9b492a13c0b6310dccdceea99e27adf271829f3ea8"},"amount":{"currency":{"symbol":"ICP","decimals":8},"value":"0.0001"}},{"operationIdentifier":{"index":2},"type":"FEE","status":"COMPLETED","account":{"address":"d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06"},"amount":{"currency":{"symbol":"ICP","decimals":8},"value":"-0.0001"}}]}}]}'

export const nftCollectionInfo = {
  id: "j3dqa-byaaa-aaaah-qcwfa-cai",
  priority: 10,
  name: "ICPCS",
  brief: "7,777 Internet Computers running on the IC",
  description: "ICPCS is a collection of generative art on the Internet Computer. Holders of ICPCS will be granted access to ICOS - a browser-based portal into the ICP ecosystem.",
  blurb: "ICPCS, or Internet Computers is a collection of 7,777 uniquely generated PC setups celebrating the evolution of the home PC. Holders will be granted exclusive perks, including access to: ICOS - a web-based, customizable and user friendly portal for everything IC related, with built-in utilities, dashboards, widgets, games and a dApp browser, as well as ICDM - a reflection rewards system for holders, tied to NRI.",
  keywords: "Utility DeFi Generative",
  web: "https://icpcs.io/",
  telegram: "",
  discord: "https://discord.com/invite/icpcs",
  twitter: "https://twitter.com/icpcsnft",
  medium: "https://icpcs.medium.com/",
  dscvr: "",
  distrikt: "",
  banner: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/nt13bt3/collection_banner.jpg",
  avatar: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/tb03b5i/avatar.jpg",
  collection: "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-09/d923bee/collection_image.jpg",
  route: "icpcs",
  commission: 0.08,
  legacy: "",
  unit: "NFT",
  nftv: true,
  mature: false,
  market: true,
  dev: false,
  external: false,
  filter: false,
  sale: false,
  earn: true,
  saletype: "v1",
  standard: "legacy",
  detailpage: "generative_assets_on_nft_canister",
  nftlicense: "",
  kyc: false,
}
