/**
 * @jest-environment jsdom
 */
import { DeviceData } from "../_ic_api/internet_identity.d"

import { transformDeviceDataToExcludeCredentials } from "./creation-options"
import { DEVICE_DATA_MOCK } from "./creation-options.mocks"

describe("creation-options test suite", () => {
  describe("transformDeviceDataToExcludeCredentials", () => {
    it("should build valid exclude credentials array", () => {
      const expected = [
        {
          type: "public-key",
          id: new Uint8Array(DEVICE_DATA_MOCK[1].credential_id[0] as number[]),
        },
      ]
      expect(
        transformDeviceDataToExcludeCredentials(
          DEVICE_DATA_MOCK as DeviceData[],
        ),
      ).toEqual(expected)
    })
  })
})
